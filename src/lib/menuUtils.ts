import { recipes, recipesById } from "@/data/recipes";
import {
  Ingredient,
  IngredientCategory,
  MealSlot,
  MealType,
  PantryItem,
  Recipe,
  ShoppingItem,
} from "@/types";

export function pickRandomRecipe(meal: MealType, excludeId?: string): Recipe {
  const pool = recipes.filter(
    (r) => r.mealTypes.includes(meal) && r.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)];
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

  // Базовые «всегда есть дома» — соль, специи, масло, лимон и т.п. — не учитываем как недостающие.
  const PANTRY_BASICS = new Set([
    "соль, перец", "соль", "перец", "корица", "куркума", "тимьян",
    "розмарин", "лавровый лист", "корица и зира", "мускатный орех",
    "разрыхлитель", "оливковое масло", "кунжутное масло", "льняное масло",
    "масло авокадо (спрей)", "семена кунжута", "кунжут",
  ]);

  let best: { recipe: Recipe; score: number; missing: number } | null = null;
  for (const r of recipes) {
    let missing = 0;
    let total = 0;
    for (const ing of r.ingredients) {
      const name = ing.name.toLowerCase();
      if (PANTRY_BASICS.has(name)) continue;
      total++;
      if (!stocked.has(name)) missing++;
    }
    if (total === 0) continue;
    const score = (total - missing) / total;
    // Подсказываем рецепт только если есть >=80% ингредиентов И не больше 1 недостающего.
    if (score >= 0.8 && missing <= 1) {
      if (!best || score > best.score || (score === best.score && missing < best.missing)) {
        best = { recipe: r, score, missing };
      }
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