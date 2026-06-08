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

export function pickRandomRecipe(
  meal: MealType,
  excludeId?: string,
  excludeIds?: Set<string>
): Recipe | null {
  let pool = recipes.filter(
    (r) =>
      r.mealTypes.includes(meal) &&
      r.id !== excludeId &&
      !(excludeIds && excludeIds.has(r.id))
  );
  if (pool.length === 0) {
    pool = recipes.filter((r) => r.mealTypes.includes(meal) && r.id !== excludeId);
  }
  if (pool.length === 0) {
    pool = recipes.filter((r) => r.mealTypes.includes(meal));
  }
  if (pool.length === 0) {
    return null;
  }
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
      const parts = normalizeIngredient(ing);
      for (const part of parts) {
        const inPantry = pantry.find(
          (p) => p.inStock && p.name.toLowerCase() === part.name.toLowerCase()
        );
        if (inPantry) continue;
        const key = `${part.name.toLowerCase()}|${part.unit}`;
        const existing = aggregate.get(key);
        if (existing) {
          existing.amount += part.amount;
        } else {
          aggregate.set(key, {
            key,
            name: part.name,
            amount: part.amount,
            unit: part.unit,
            category: part.category,
            checked: !!checked[key],
          });
        }
      }
    }
  }

  const result: Record<IngredientCategory, ShoppingItem[]> = {
    fruit_veg: [],
    grains: [],
    meat_fish: [],
    dairy_alt: [],
    spices: [],
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
  grains: "Крупы и хлеб (желательно без глютена)",
  meat_fish: "Мясо и рыба",
  dairy_alt: "Молочка и альтернативы",
  spices: "Специи",
  other: "Остальное",
};

export const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  fruit_veg: "🥬",
  grains: "🌾",
  meat_fish: "🐟",
  dairy_alt: "🥛",
  spices: "🧂",
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

  // Сравниваем по НОРМАЛИЗОВАННЫМ названиям — так же, как они хранятся
  // в кладовой. Иначе «куриная грудка» в рецепте не совпадёт с «Куриное филе»
  // в кладовой.
  const meaningfulStocked = new Set(
    [...stocked].filter((n) => !PANTRY_BASICS.has(n))
  );
  const pickedCount = meaningfulStocked.size;
  if (pickedCount === 0) return null;

  // Порог: чтобы рецепт считался релевантным, должно совпасть
  // не менее половины выбранных пользователем продуктов
  // (и минимум 2, если выбрано 2+).
  const requiredMatches = pickedCount === 1 ? 1 : Math.max(2, Math.ceil(pickedCount / 2));

  let best: { recipe: Recipe; matched: number; score: number } | null = null;

  for (const r of recipes) {
    const recipeNames = new Set<string>();
    for (const ing of r.ingredients) {
      const parts = normalizeIngredient(ing);
      for (const part of parts) {
        const low = part.name.toLowerCase();
        if (PANTRY_BASICS.has(low)) continue;
        recipeNames.add(low);
      }
    }
    if (recipeNames.size === 0) continue;

    let matched = 0;
    for (const n of meaningfulStocked) if (recipeNames.has(n)) matched++;
    if (matched < requiredMatches) continue;

    // score — насколько рецепт «покрыт» имеющимися продуктами
    const score = matched / recipeNames.size;
    if (
      !best ||
      matched > best.matched ||
      (matched === best.matched && score > best.score)
    ) {
      best = { recipe: r, matched, score };
    }
  }

  return best?.recipe ?? null;
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
      const parts = normalizeIngredient(ing);
      for (const part of parts) {
        const id = part.name.toLowerCase();
        if (map.has(id)) continue;
        map.set(id, { id, name: part.name, category: part.category, inStock: false });
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

// =========================================================================
// Нормализация ингредиентов: применяется и в кладовой, и в списке покупок,
// чтобы названия совпадали один в один (Творог = Творог, не «Творог 5%»).
// =========================================================================

const SKIP_NAMES = new Set<string>(["вода", "тёмный шоколад капли"]);

const NAME_REPLACE: Record<string, string> = {
  "яблоко зелёное": "Яблоко",
  "лимонный сок": "Лимон",
  "куриная грудка": "Куриное филе",
  "говяжья вырезка": "Говядина",
  "сулугуни тёртый": "Сулугуни",
  "творог мягкий": "Творог",
  "творог 5%": "Творог",
  "зелень (петрушка)": "Петрушка",
  "зелень (укроп)": "Укроп",
  "овсяные хлопья без глютена": "Овсяные хлопья (желательно без глютена)",
  "овсяная мука без глютена": "Овсяная мука (желательно без глютена)",
  "паста мелкая (без глютена)": "Паста мелкая (желательно без глютена)",
  "тамари (соевый соус б/глютена)": "Соевый соус",
  "семена кунжута": "Кунжут",
};

const NAME_SPLIT: Record<string, string[]> = {
  "зелень (петрушка, мята)": ["Петрушка", "Мята"],
  "зелень (петрушка, укроп)": ["Петрушка", "Укроп"],
  "корица и зира": ["Корица", "Зира"],
};

const CATEGORY_OVERRIDES: Record<string, IngredientCategory> = {
  "корица": "spices",
  "зира": "spices",
  "куркума": "spices",
  "тимьян": "spices",
  "розмарин": "spices",
  "лавровый лист": "spices",
  "мускатный орех": "spices",
  "соль, перец": "spices",
  "разрыхлитель": "spices",
  "ванилин": "spices",
  "дрожжи сухие": "spices",
  "чечевица красная": "grains",
  "кунжут": "spices",
  "тыквенные семечки": "spices",
  "яйцо": "other",
};

interface NormalizedIngredient {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

function normalizeIngredient(ing: Ingredient): NormalizedIngredient[] {
  const low = ing.name.toLowerCase();
  if (SKIP_NAMES.has(low)) return [];
  const names = NAME_SPLIT[low] ?? [NAME_REPLACE[low] ?? ing.name];
  const share = ing.amount / names.length;
  return names.map((name) => {
    const id = name.toLowerCase();
    return {
      name,
      amount: share,
      unit: ing.unit,
      category: CATEGORY_OVERRIDES[id] ?? ing.category,
    };
  });
}

export type { Ingredient };