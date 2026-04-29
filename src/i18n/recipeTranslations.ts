import enRecipes from "./recipes.en.json";
import { Recipe } from "@/types";
import type { Lang } from "./index";

/**
 * Перевод одного рецепта по словарю. Если перевод отсутствует —
 * возвращаем русский оригинал. Имена ингредиентов переводятся
 * через общий словарь ingredient names.
 */

export interface RecipeEnEntry {
  title: string;
  steps: string[];
  brainNote?: string;
  childFriendlyNote?: string;
  tags?: string[];
  ingredients?: string[]; // parallel array — translated ingredient names
}

const enMap = enRecipes as Record<string, RecipeEnEntry>;

export function localizeRecipe(recipe: Recipe, lang: Lang): Recipe {
  if (lang === "ru") return recipe;
  const e = enMap[recipe.id];
  if (!e) return recipe;
  return {
    ...recipe,
    title: e.title || recipe.title,
    steps: e.steps?.length ? e.steps : recipe.steps,
    brainNote: e.brainNote ?? recipe.brainNote,
    childFriendlyNote: e.childFriendlyNote ?? recipe.childFriendlyNote,
    tags: e.tags?.length ? e.tags : recipe.tags,
    ingredients: e.ingredients?.length
      ? recipe.ingredients.map((ing, i) => ({
          ...ing,
          name: e.ingredients?.[i] || ing.name,
          unit: translateUnit(ing.unit, lang),
        }))
      : recipe.ingredients.map((ing) => ({ ...ing, unit: translateUnit(ing.unit, lang) })),
  };
}

const UNIT_EN: Record<string, string> = {
  "г": "g",
  "мл": "ml",
  "л": "L",
  "шт": "pcs",
  "ст.л.": "tbsp",
  "ч.л.": "tsp",
  "пучок": "bunch",
  "ломтика": "slices",
  "ломтиков": "slices",
  "зубчика": "cloves",
  "зубчиков": "cloves",
  "стебля": "stalks",
  "стеблей": "stalks",
  "щепотка": "pinch",
};

export function translateUnit(unit: string, lang: Lang): string {
  if (lang === "ru") return unit;
  return UNIT_EN[unit] ?? unit;
}

/** Перевод имени ингредиента отдельно (для списка покупок и кладовой). */
export function localizeIngredientName(name: string, lang: Lang): string {
  if (lang === "ru") return name;
  // Build a global lookup once
  if (!cachedLookup) {
    cachedLookup = new Map();
    for (const id of Object.keys(enMap)) {
      const e = enMap[id];
      if (!e.ingredients) continue;
      // We need to pair with original russian names; fetch from recipes data.
      // Done lazily via setIngredientPair.
    }
  }
  return cachedLookup.get(name.toLowerCase()) ?? name;
}

let cachedLookup: Map<string, string> | null = null;

/** Регистрирует пары ru-en имён ингредиентов из всего набора рецептов. */
export function buildIngredientLookup(recipes: Recipe[]) {
  cachedLookup = new Map();
  for (const r of recipes) {
    const e = enMap[r.id];
    if (!e?.ingredients) continue;
    r.ingredients.forEach((ing, i) => {
      const en = e.ingredients?.[i];
      if (en && !cachedLookup!.has(ing.name.toLowerCase())) {
        cachedLookup!.set(ing.name.toLowerCase(), en);
      }
    });
  }
}