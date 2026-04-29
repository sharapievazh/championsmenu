import enRecipes from "./recipes.en.json";
import { Recipe } from "@/types";
import type { Lang } from "./index";
import { recipes as allRecipes } from "@/data/recipes";

export interface RecipeEnEntry {
  title: string;
  steps: string[];
  brainNote?: string;
  childFriendlyNote?: string;
  tags?: string[];
  ingredients?: string[];
}

const enMap = enRecipes as Record<string, RecipeEnEntry>;

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

export function localizeRecipe(recipe: Recipe, lang: Lang): Recipe {
  if (lang === "ru") return recipe;
  const e = enMap[recipe.id];
  if (!e) {
    return {
      ...recipe,
      ingredients: recipe.ingredients.map((ing) => ({ ...ing, unit: translateUnit(ing.unit, lang) })),
    };
  }
  return {
    ...recipe,
    title: e.title || recipe.title,
    steps: e.steps?.length ? e.steps : recipe.steps,
    brainNote: e.brainNote || recipe.brainNote,
    childFriendlyNote: e.childFriendlyNote || recipe.childFriendlyNote,
    tags: e.tags?.length ? e.tags : recipe.tags,
    ingredients: recipe.ingredients.map((ing, i) => ({
      ...ing,
      name: e.ingredients?.[i] || ing.name,
      unit: translateUnit(ing.unit, lang),
    })),
  };
}

let cachedLookup: Map<string, string> | null = null;

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

function ensureLookup() {
  if (!cachedLookup) buildIngredientLookup(allRecipes);
}

export function localizeIngredientName(name: string, lang: Lang): string {
  if (lang === "ru") return name;
  ensureLookup();
  return cachedLookup!.get(name.toLowerCase()) ?? name;
}
