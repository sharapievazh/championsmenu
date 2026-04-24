import { MealSlot } from "@/types";

export const DAYS: { key: MealSlot["day"]; label: string; short: string }[] = [
  { key: "mon", label: "Понедельник", short: "Пн" },
  { key: "tue", label: "Вторник", short: "Вт" },
  { key: "wed", label: "Среда", short: "Ср" },
  { key: "thu", label: "Четверг", short: "Чт" },
  { key: "fri", label: "Пятница", short: "Пт" },
  { key: "sat", label: "Суббота", short: "Сб" },
  { key: "sun", label: "Воскресенье", short: "Вс" },
];

export const MEAL_LABELS: Record<MealSlot["meal"], string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
};

export const MEAL_EMOJI: Record<MealSlot["meal"], string> = {
  breakfast: "🌅",
  lunch: "🥗",
  dinner: "🌙",
};

export const defaultMenu: MealSlot[] = [
  { day: "mon", meal: "breakfast", recipeId: "oat-bowl" },
  { day: "mon", meal: "lunch", recipeId: "salmon-rice" },
  { day: "mon", meal: "dinner", recipeId: "chicken-stew" },

  { day: "tue", meal: "breakfast", recipeId: "avocado-toast" },
  { day: "tue", meal: "lunch", recipeId: "tuna-salad" },
  { day: "tue", meal: "dinner", recipeId: "turkey-meatballs" },

  { day: "wed", meal: "breakfast", recipeId: "chia-pudding" },
  { day: "wed", meal: "lunch", recipeId: "quinoa-bowl" },
  { day: "wed", meal: "dinner", recipeId: "baked-cod" },

  { day: "thu", meal: "breakfast", recipeId: "salmon-pancakes" },
  { day: "thu", meal: "lunch", recipeId: "lentil-soup" },
  { day: "thu", meal: "dinner", recipeId: "chicken-buckwheat" },

  { day: "fri", meal: "breakfast", recipeId: "walnut-porridge" },
  { day: "fri", meal: "lunch", recipeId: "veggie-frittata" },
  { day: "fri", meal: "dinner", recipeId: "mackerel" },

  { day: "sat", meal: "breakfast", recipeId: "berry-pancakes" },
  { day: "sat", meal: "lunch", recipeId: "egg-muffins" },
  { day: "sat", meal: "dinner", recipeId: "shrimp-zoodles" },

  { day: "sun", meal: "breakfast", recipeId: "green-juice" },
  { day: "sun", meal: "lunch", recipeId: "sweet-potato" },
  { day: "sun", meal: "dinner", recipeId: "beef-stirfry" },
];