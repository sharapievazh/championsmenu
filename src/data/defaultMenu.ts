import { MealSlot, MealType } from "@/types";
import { recipes } from "@/data/recipes";

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

/**
 * Дефолтное меню на 4 недели формируется автоматически из полной базы
 * рецептов. Внутри одной недели блюда не повторяются; между неделями
 * стараемся не использовать одно и то же дважды, чтобы за месяц человек
 * увидел как можно больше разных рецептов.
 */
const DAY_KEYS: MealSlot["day"][] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDefaultMenu(): MealSlot[] {
  const pools: Record<MealType, string[]> = {
    breakfast: seededShuffle(
      recipes.filter((r) => r.mealTypes.includes("breakfast")).map((r) => r.id),
      11
    ),
    lunch: seededShuffle(
      recipes.filter((r) => r.mealTypes.includes("lunch")).map((r) => r.id),
      22
    ),
    dinner: seededShuffle(
      recipes.filter((r) => r.mealTypes.includes("dinner")).map((r) => r.id),
      33
    ),
  };
  const cursor: Record<MealType, number> = { breakfast: 0, lunch: 0, dinner: 0 };
  const slots: MealSlot[] = [];

  for (let w = 1; w <= 4; w++) {
    const usedInWeek = new Set<string>();
    for (const day of DAY_KEYS) {
      for (const meal of MEALS) {
        const pool = pools[meal];
        if (pool.length === 0) continue;
        let id = pool[cursor[meal] % pool.length];
        let tries = 0;
        while (usedInWeek.has(id) && tries < pool.length) {
          cursor[meal]++;
          id = pool[cursor[meal] % pool.length];
          tries++;
        }
        cursor[meal]++;
        usedInWeek.add(id);
        slots.push({ day, meal, recipeId: id, week: w as 1 | 2 | 3 | 4 });
      }
    }
  }
  return slots;
}

export const defaultMenu: MealSlot[] = buildDefaultMenu();