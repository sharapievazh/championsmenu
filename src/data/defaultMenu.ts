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

// Меню составлено на 2 недели (14 дней). Переключение между неделями — в UI.
export const defaultMenu: MealSlot[] = [
  // ===== Неделя 1 =====
  { day: "mon", meal: "breakfast", recipeId: "oat-bowl", week: 1 },
  { day: "mon", meal: "lunch", recipeId: "broccoli-cream-soup", week: 1 },
  { day: "mon", meal: "dinner", recipeId: "lemon-chicken", week: 1 },

  { day: "tue", meal: "breakfast", recipeId: "buckwheat-waffles", week: 1 },
  { day: "tue", meal: "lunch", recipeId: "tuna-salad", week: 1 },
  { day: "tue", meal: "dinner", recipeId: "turkey-meatballs", week: 1 },

  { day: "wed", meal: "breakfast", recipeId: "chia-pudding", week: 1 },
  { day: "wed", meal: "lunch", recipeId: "pumpkin-cream-soup", week: 1 },
  { day: "wed", meal: "dinner", recipeId: "baked-cod", week: 1 },

  { day: "thu", meal: "breakfast", recipeId: "banana-pancakes", week: 1 },
  { day: "thu", meal: "lunch", recipeId: "lentil-soup", week: 1 },
  { day: "thu", meal: "dinner", recipeId: "chicken-buckwheat", week: 1 },

  { day: "fri", meal: "breakfast", recipeId: "walnut-porridge", week: 1 },
  { day: "fri", meal: "lunch", recipeId: "lentil-waffles", week: 1 },
  { day: "fri", meal: "dinner", recipeId: "mackerel", week: 1 },

  { day: "sat", meal: "breakfast", recipeId: "berry-pancakes", week: 1 },
  { day: "sat", meal: "lunch", recipeId: "filo-spiral", week: 1 },
  { day: "sat", meal: "dinner", recipeId: "shrimp-zoodles", week: 1 },

  { day: "sun", meal: "breakfast", recipeId: "cottage-bowl", week: 1 },
  { day: "sun", meal: "lunch", recipeId: "salmon-poke", week: 1 },
  { day: "sun", meal: "dinner", recipeId: "beef-stirfry", week: 1 },

  // ===== Неделя 2 =====
  { day: "mon", meal: "breakfast", recipeId: "pumpkin-waffles", week: 2 },
  { day: "mon", meal: "lunch", recipeId: "cauliflower-cream-soup", week: 2 },
  { day: "mon", meal: "dinner", recipeId: "turkey-spinach", week: 2 },

  { day: "tue", meal: "breakfast", recipeId: "salmon-pancakes", week: 2 },
  { day: "tue", meal: "lunch", recipeId: "quinoa-bowl", week: 2 },
  { day: "tue", meal: "dinner", recipeId: "chicken-stirfry", week: 2 },

  { day: "wed", meal: "breakfast", recipeId: "avocado-toast", week: 2 },
  { day: "wed", meal: "lunch", recipeId: "broccoli-cream-soup", week: 2 },
  { day: "wed", meal: "dinner", recipeId: "salmon-rice", week: 2 },

  { day: "thu", meal: "breakfast", recipeId: "buckwheat-waffles", week: 2 },
  { day: "thu", meal: "lunch", recipeId: "veggie-frittata", week: 2 },
  { day: "thu", meal: "dinner", recipeId: "turkey-burgers", week: 2 },

  { day: "fri", meal: "breakfast", recipeId: "chia-pudding", week: 2 },
  { day: "fri", meal: "lunch", recipeId: "pumpkin-cream-soup", week: 2 },
  { day: "fri", meal: "dinner", recipeId: "chicken-stew", week: 2 },

  { day: "sat", meal: "breakfast", recipeId: "zucchini-fritters", week: 2 },
  { day: "sat", meal: "lunch", recipeId: "egg-muffins", week: 2 },
  { day: "sat", meal: "dinner", recipeId: "beef-stew", week: 2 },

  { day: "sun", meal: "breakfast", recipeId: "green-juice", week: 2 },
  { day: "sun", meal: "lunch", recipeId: "sweet-potato", week: 2 },
  { day: "sun", meal: "dinner", recipeId: "baked-cod", week: 2 },

  // ===== Неделя 3 — больше выпечки/роллов и блюд из птицы =====
  { day: "mon", meal: "breakfast", recipeId: "syrniki", week: 3 },
  { day: "mon", meal: "lunch", recipeId: "mushroom-cream-soup", week: 3 },
  { day: "mon", meal: "dinner", recipeId: "pp-pizza", week: 3 },

  { day: "tue", meal: "breakfast", recipeId: "berry-smoothie", week: 3 },
  { day: "tue", meal: "lunch", recipeId: "chicken-meatball-soup", week: 3 },
  { day: "tue", meal: "dinner", recipeId: "spring-rolls", week: 3 },

  { day: "wed", meal: "breakfast", recipeId: "cottage-casserole", week: 3 },
  { day: "wed", meal: "lunch", recipeId: "broccoli-cream-soup", week: 3 },
  { day: "wed", meal: "dinner", recipeId: "turkey-roast", week: 3 },

  { day: "thu", meal: "breakfast", recipeId: "pumpkin-waffles", week: 3 },
  { day: "thu", meal: "lunch", recipeId: "veggie-sticks", week: 3 },
  { day: "thu", meal: "dinner", recipeId: "chicken-wrap", week: 3 },

  { day: "fri", meal: "breakfast", recipeId: "cocoa-smoothie", week: 3 },
  { day: "fri", meal: "lunch", recipeId: "lentil-soup", week: 3 },
  { day: "fri", meal: "dinner", recipeId: "grill-rolls", week: 3 },

  { day: "sat", meal: "breakfast", recipeId: "protein-brownies", week: 3 },
  { day: "sat", meal: "lunch", recipeId: "khachapuri", week: 3 },
  { day: "sat", meal: "dinner", recipeId: "salmon-rice", week: 3 },

  { day: "sun", meal: "breakfast", recipeId: "banana-pancakes", week: 3 },
  { day: "sun", meal: "lunch", recipeId: "chicken-stew", week: 3 },
  { day: "sun", meal: "dinner", recipeId: "turkey-meatballs", week: 3 },

  // ===== Неделя 4 =====
  { day: "mon", meal: "breakfast", recipeId: "oat-cookies", week: 4 },
  { day: "mon", meal: "lunch", recipeId: "pumpkin-cream-soup", week: 4 },
  { day: "mon", meal: "dinner", recipeId: "chicken-wrap", week: 4 },

  { day: "tue", meal: "breakfast", recipeId: "mango-smoothie", week: 4 },
  { day: "tue", meal: "lunch", recipeId: "tuna-salad", week: 4 },
  { day: "tue", meal: "dinner", recipeId: "pp-pizza", week: 4 },

  { day: "wed", meal: "breakfast", recipeId: "syrniki", week: 4 },
  { day: "wed", meal: "lunch", recipeId: "mushroom-cream-soup", week: 4 },
  { day: "wed", meal: "dinner", recipeId: "spring-rolls", week: 4 },

  { day: "thu", meal: "breakfast", recipeId: "buckwheat-waffles", week: 4 },
  { day: "thu", meal: "lunch", recipeId: "chicken-meatball-soup", week: 4 },
  { day: "thu", meal: "dinner", recipeId: "turkey-spinach", week: 4 },

  { day: "fri", meal: "breakfast", recipeId: "cottage-casserole", week: 4 },
  { day: "fri", meal: "lunch", recipeId: "cauliflower-cream-soup", week: 4 },
  { day: "fri", meal: "dinner", recipeId: "grill-rolls", week: 4 },

  { day: "sat", meal: "breakfast", recipeId: "berry-pancakes", week: 4 },
  { day: "sat", meal: "lunch", recipeId: "khachapuri", week: 4 },
  { day: "sat", meal: "dinner", recipeId: "lemon-chicken", week: 4 },

  { day: "sun", meal: "breakfast", recipeId: "baked-apples", week: 4 },
  { day: "sun", meal: "lunch", recipeId: "quinoa-bowl", week: 4 },
  { day: "sun", meal: "dinner", recipeId: "turkey-roast", week: 4 },
];