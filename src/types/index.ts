export type MealType = "breakfast" | "lunch" | "dinner";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * Дополнительная категория рецепта для быстрых разделов в шапке:
 * десерты, смузи/коктейли, снеки, выпечка и роллы.
 * Не пересекается с mealTypes — рецепт может иметь и то и то.
 */
export type RecipeCategory =
  | "dessert"
  | "smoothie"
  | "snack"
  | "bakery";

export type IngredientCategory =
  | "fruit_veg"
  | "grains"
  | "meat_fish"
  | "dairy_alt"
  | "other";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string; // "г", "мл", "шт", "ст.л.", "ч.л."
  category: IngredientCategory;
}

export interface Nutrition {
  kcalAdult: number;
  kcalChild: number;
  protein: number; // г
  fat: number;
  carbs: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  mealTypes: MealType[];
  /** Дополнительные категории (десерт/смузи/снек/выпечка). */
  categories?: RecipeCategory[];
  servings: number; // обычно 4
  timeMin: number;
  ingredients: Ingredient[];
  steps: string[];
  nutrition: Nutrition;
  tags: string[]; // "без глютена", "без лактозы" и т.п.
  brainBoost?: boolean; // питание для шахматиста
  freezable?: boolean; // подходит для заморозки
  prepAhead?: boolean; // можно подготовить заранее
  childFriendlyNote?: string;
  brainNote?: string;
}

export interface MealSlot {
  day: DayKey;
  meal: MealType;
  recipeId: string;
  /** Номер недели в плане: 1, 2, 3 или 4. */
  week: 1 | 2 | 3 | 4;
}

export interface PantryItem {
  id: string;
  name: string;
  category: IngredientCategory;
  inStock: boolean;
}

export interface ShoppingItem {
  key: string; // name+unit
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
}