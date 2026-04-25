import { useState } from "react";
import { useMenu } from "@/store/useAppStore";
import { DAYS, MEAL_LABELS, MEAL_EMOJI } from "@/data/defaultMenu";
import { MealCard } from "../MealCard";
import { RecipeDialog } from "../RecipeDialog";
import { recipesById } from "@/data/recipes";
import { pickRandomRecipe, getPrepDayTasks, totalKcalForDay } from "@/lib/menuUtils";
import { Recipe, MealType, DayKey } from "@/types";
import { Snowflake, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function MenuScreen() {
  const [menu, setMenu] = useMenu();
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [week, setWeek] = useState<1 | 2>(1);

  const weekMenu = menu.filter((s) => s.week === week);

  const swap = (day: DayKey, meal: MealType, currentId: string) => {
    const next = pickRandomRecipe(meal, currentId);
    setMenu((prev) =>
      prev.map((s) =>
        s.day === day && s.meal === meal && s.week === week
          ? { ...s, recipeId: next.id }
          : s
      )
    );
    toast.success(`Заменили на: ${next.title}`);
  };

  const prepTasks = getPrepDayTasks(weekMenu);

  return (
    <div className="space-y-5 pb-24">
      <header className="px-4 pt-4">
        <h1 className="text-3xl font-bold text-foreground">Меню недели</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Свайп влево чтобы заменить блюдо · нажмите для рецепта
        </p>
        <div className="mt-3 inline-flex rounded-full bg-muted p-1">
          {[1, 2].map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w as 1 | 2)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                week === w
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Неделя {w}
            </button>
          ))}
        </div>
      </header>

      {DAYS.map((d) => {
        const slots = weekMenu.filter((s) => s.day === d.key);
        const kcal = totalKcalForDay(weekMenu, d.key);
        const isPrepDay = d.key === "sat";
        return (
          <section key={d.key} className="px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{d.label}</h2>
                {isPrepDay && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-freeze/15 text-freeze px-2 py-0.5 text-[11px] font-semibold">
                    <Snowflake className="h-3 w-3" /> День заготовок
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {kcal.adult} / {kcal.child} ккал
              </span>
            </div>
            <div className="space-y-2">
              {slots.map((s) => (
                <div key={s.meal} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-1">
                    {MEAL_EMOJI[s.meal]} {MEAL_LABELS[s.meal]}
                  </div>
                  <MealCard
                    slot={s}
                    onSwap={() => swap(s.day, s.meal, s.recipeId)}
                    onOpen={() => setSelected(recipesById[s.recipeId])}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mx-4 rounded-2xl bg-gradient-mint p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-xl font-bold">День заготовок: суббота</h2>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Заготовьте впрок, чтобы будни прошли легче.
        </p>
        <ul className="space-y-1.5">
          {prepTasks.map((t) => (
            <li key={t.recipe.id} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-foreground flex-shrink-0" />
              <span>
                <strong>{t.recipe.title}</strong> — {t.reason}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <RecipeDialog
        recipe={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}