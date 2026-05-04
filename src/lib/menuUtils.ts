import { recipes, recipesById } from "@/data/recipes";
import {
  DayKey,
  Ingredient,
  IngredientCategory,
  MealSlot,
  MealType,
  PantryItem,
  Recipe,
  ShoppingItem,
} from "@/types";
import type { RecipeRatings } from "@/store/useAppStore";

export function pickRandomRecipe(meal: MealType, excludeId?: string): Recipe {
  const pool = recipes.filter(
    (r) => r.mealTypes.includes(meal) && r.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Собрать неделю из любимых блюд. Берём только те, что отмечены ❤️,
 * исключаем 👎. Если для какого-то приёма пищи любимых не хватает —
 * добираем случайные не-нелюбимые, чтобы план был полон.
 * Внутри одной недели стараемся не повторять блюда.
 */
export function buildWeekFromFavorites(
  ratings: RecipeRatings,
  week: 1 | 2 | 3 | 4,
  days: { key: DayKey }[]
): { slots: MealSlot[]; usedFavorites: number; total: number } {
  const meals: MealType[] = ["breakfast", "lunch", "dinner"];
  const isLoved = (r: Recipe) => ratings[r.id] === "love";
  const isDisliked = (r: Recipe) => ratings[r.id] === "dislike";

  const slots: MealSlot[] = [];
  const used = new Set<string>();
  let usedFavorites = 0;
  const total = days.length * meals.length;

  const pickFor = (meal: MealType): Recipe | null => {
    const loved = recipes.filter(
      (r) => r.mealTypes.includes(meal) && isLoved(r) && !used.has(r.id)
    );
    if (loved.length > 0) {
      const r = loved[Math.floor(Math.random() * loved.length)];
      used.add(r.id);
      usedFavorites++;
      return r;
    }
    // нет неиспользованных любимых — позволяем повтор любимых
    const lovedAny = recipes.filter((r) => r.mealTypes.includes(meal) && isLoved(r));
    if (lovedAny.length > 0) {
      const r = lovedAny[Math.floor(Math.random() * lovedAny.length)];
      usedFavorites++;
      return r;
    }
    // добираем случайные не-дизлайкнутые
    const fallback = recipes.filter(
      (r) => r.mealTypes.includes(meal) && !isDisliked(r) && !used.has(r.id)
    );
    const pool = fallback.length > 0
      ? fallback
      : recipes.filter((r) => r.mealTypes.includes(meal) && !isDisliked(r));
    if (pool.length === 0) return null;
    const r = pool[Math.floor(Math.random() * pool.length)];
    used.add(r.id);
    return r;
  };

  for (const d of days) {
    for (const meal of meals) {
      const r = pickFor(meal);
      if (!r) continue;
      slots.push({ day: d.key, meal, recipeId: r.id, week });
    }
  }
  return { slots, usedFavorites, total };
}

export function buildShoppingList(
  menu: MealSlot[],
  pantry: PantryItem[],
  checked: Record<string, boolean>
): Record<IngredientCategory, ShoppingItem[]> {
  const aggregate = new Map<string, ShoppingItem>();

  for (const slot of menu) {
    const recipe = recipesById[slot.recipeId];
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      const inPantry = pantry.find(
        (p) => p.inStock && p.name.toLowerCase() === ing.name.toLowerCase()
      );
      if (inPantry) continue;
      const existing = aggregate.get(key);
      if (existing) {
        existing.amount += ing.amount;
      } else {
        aggregate.set(key, {
          key,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
          checked: !!checked[key],
        });
      }
    }
  }

  const result: Record<IngredientCategory, ShoppingItem[]> = {
    fruit_veg: [],
    grains: [],
    meat_fish: [],
    dairy_alt: [],
    other: [],
  };
  for (const item of aggregate.values()) {
    item.amount = Math.round(item.amount * 10) / 10;
    result[item.category].push(item);
  }
  for (const cat of Object.keys(result) as IngredientCategory[]) {
    result[cat].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }
  return result;
}

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  fruit_veg: "Фрукты и овощи",
  grains: "Крупы и хлеб (без глютена)",
  meat_fish: "Мясо и рыба",
  dairy_alt: "Молочка и альтернативы",
  other: "Остальное",
};

export const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  fruit_veg: "🥬",
  grains: "🌾",
  meat_fish: "🐟",
  dairy_alt: "🥛",
  other: "🫙",
};

export function suggestFromPantry(pantry: PantryItem[]): Recipe | null {
  const stocked = new Set(
    pantry.filter((p) => p.inStock).map((p) => p.name.toLowerCase())
  );
  if (stocked.size === 0) return null;

  // Базовые «всегда есть дома» — не учитываем.
  const PANTRY_BASICS = new Set([
    "соль, перец", "соль", "перец", "корица", "куркума", "тимьян",
    "розмарин", "лавровый лист", "корица и зира", "мускатный орех",
    "разрыхлитель", "оливковое масло", "кунжутное масло", "льняное масло",
    "масло авокадо (спрей)", "семена кунжута", "кунжут",
  ]);

  // Главное правило: достаточно совпадения по белковой основе (мясо/рыба).
  // Остальные ингредиенты человек найдёт или заменит.
  let bestProtein: { recipe: Recipe; matched: number; score: number } | null = null;
  let bestAny: { recipe: Recipe; matched: number; score: number } | null = null;

  for (const r of recipes) {
    let matched = 0;
    let total = 0;
    let proteinMatched = 0;
    let proteinTotal = 0;
    for (const ing of r.ingredients) {
      const name = ing.name.toLowerCase();
      if (PANTRY_BASICS.has(name)) continue;
      total++;
      const isStocked = stocked.has(name);
      if (isStocked) matched++;
      if (ing.category === "meat_fish") {
        proteinTotal++;
        if (isStocked) proteinMatched++;
      }
    }
    if (total === 0) continue;
    const score = matched / total;

    // Приоритет 1: рецепт с мясом/рыбой, у которого основной белок есть в кладовой.
    if (proteinTotal > 0 && proteinMatched > 0) {
      if (
        !bestProtein ||
        proteinMatched > (bestProtein.recipe.ingredients.filter(
          (i) => i.category === "meat_fish" && stocked.has(i.name.toLowerCase())
        ).length) ||
        score > bestProtein.score
      ) {
        bestProtein = { recipe: r, matched, score };
      }
    }

    // Приоритет 2 (запасной): любой рецепт с хотя бы одним совпадением.
    if (matched >= 1) {
      if (!bestAny || matched > bestAny.matched || (matched === bestAny.matched && score > bestAny.score)) {
        bestAny = { recipe: r, matched, score };
      }
    }
  }

  return bestProtein?.recipe ?? bestAny?.recipe ?? null;
}

export function getPrepDayTasks(menu: MealSlot[]): {
  recipe: Recipe;
  reason: string;
}[] {
  const tasks: { recipe: Recipe; reason: string }[] = [];
  const seen = new Set<string>();
  for (const slot of menu) {
    const r = recipesById[slot.recipeId];
    if (!r || seen.has(r.id)) continue;
    if (r.freezable) {
      tasks.push({ recipe: r, reason: "Можно приготовить и заморозить" });
      seen.add(r.id);
    } else if (r.prepAhead) {
      tasks.push({ recipe: r, reason: "Подготовить заранее (нарезать/замочить)" });
      seen.add(r.id);
    }
  }
  return tasks.slice(0, 8);
}

export function totalKcalForDay(menu: MealSlot[], day: MealSlot["day"]) {
  const slots = menu.filter((s) => s.day === day);
  let adult = 0;
  let child = 0;
  for (const s of slots) {
    const r = recipesById[s.recipeId];
    if (!r) continue;
    adult += r.nutrition.kcalAdult;
    child += r.nutrition.kcalChild;
  }
  return { adult, child };
}

export function ingredientsToPantryItems(): PantryItem[] {
  const map = new Map<string, PantryItem>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      const id = ing.name.toLowerCase();
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: ing.name,
          category: ing.category,
          inStock: false,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export type { Ingredient };