export type MealType = "breakfast" | "lunch" | "dinner";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

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