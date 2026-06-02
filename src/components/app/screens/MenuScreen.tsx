import { useState, useCallback, memo } from "react";
import { useMenu, useRatings } from "@/store/useAppStore";
import { DAYS } from "@/data/defaultMenu";
import { MealCard } from "../MealCard";
import { RecipeDialog } from "../RecipeDialog";
import { recipesById } from "@/data/recipes";
import {
  pickRandomRecipe,
  getPrepDayTasks,
  totalKcalForDay,
  buildWeekFromFavorites,
} from "@/lib/menuUtils";
import { Recipe, MealType, DayKey, MealSlot } from "@/types";
import { Snowflake, Sparkles, Printer, Heart } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { LangSwitcher } from "@/i18n/LangSwitcher";
import { localizeRecipe } from "@/i18n/recipeTranslations";

interface MenuScreenProps {
  onPrint?: (weeks: (1 | 2 | 3 | 4)[]) => void;
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MEAL_KEYS = ["breakfast", "lunch", "dinner"] as const;
const MEAL_EMOJI: Record<MealType, string> = { breakfast: "🌅", lunch: "🥗", dinner: "🌙" };

export function MenuScreen({ onPrint }: MenuScreenProps = {}) {
  const { t, lang } = useT();
  const [menu, setMenu] = useMenu();
  const [ratings] = useRatings();
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [week, setWeek] = useState<1 | 2 | 3 | 4>(1);

  const weekMenu = menu.filter((s) => s.week === week);

  const swap = useCallback((day: DayKey, meal: MealType, currentId: string) => {
    const next = pickRandomRecipe(meal, currentId);
    setMenu((prev) =>
      prev.map((s) =>
        s.day === day && s.meal === meal && s.week === week
          ? { ...s, recipeId: next.id }
          : s
      )
    );
    toast.success(`${t("toast_swap")} ${localizeRecipe(next, lang).title}`);
  }, [week, setMenu, t, lang]);

  const prepTasks = getPrepDayTasks(weekMenu);
  const lovedCount = Object.values(ratings).filter((v) => v === "love").length;

  const buildFromFavorites = () => {
    if (lovedCount < 3) {
      toast.error(t("toast_need_favorites"), { description: t("toast_need_favorites_desc") });
      return;
    }
    const { slots, usedFavorites, total } = buildWeekFromFavorites(ratings, week, DAYS);
    setMenu((prev: MealSlot[]) => [...prev.filter((s) => s.week !== week), ...slots]);
    toast.success(t("toast_week_built", { n: week }), {
      description: t("toast_week_built_desc", { used: usedFavorites, total }),
    });
  };

  const handlePrint = (scope: "current" | "all") => {
    const weeks = scope === "current" ? [week] : ([1, 2, 3, 4] as const);
    onPrint?.(weeks as (1 | 2 | 3 | 4)[]);
    setTimeout(() => window.print(), 60);
  };

  return (
    <div className="space-y-5 pb-24">
      <header className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">{t("menu_title")}</h1>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <button
              onClick={() => handlePrint("current")}
              className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft hover:bg-muted transition-colors"
              aria-label={t("print_menu_aria")}
            >
              <Printer className="h-3.5 w-3.5" /> {t("print")}
            </button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{t("menu_hint")}</p>
        <div className="mt-3 inline-flex rounded-full bg-muted p-1 flex-wrap">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w as 1 | 2 | 3 | 4)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                week === w
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("week")} {w}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={buildFromFavorites}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-mint text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-glow hover:opacity-90 transition-opacity"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            {t("build_from_favorites")}
            {lovedCount > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/25 px-1.5 py-0.5 text-[10px]">
                {lovedCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {DAY_KEYS.map((dKey) => {
        const slots = weekMenu.filter((s) => s.day === dKey);
        const kcal = totalKcalForDay(weekMenu, dKey);
        const isPrepDay = dKey === "sat";
        return (
          <section key={dKey} className="px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{t(`day_${dKey}` as any)}</h2>
                {isPrepDay && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-freeze/15 text-freeze px-2 py-0.5 text-[11px] font-semibold">
                    <Snowflake className="h-3 w-3" /> {t("prep_day_badge")}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {kcal.adult} / {kcal.child} {t("kcal")}
              </span>
            </div>
            <div className="space-y-2">
              {slots.map((s) => (
                <div key={s.meal} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-1">
                    {MEAL_EMOJI[s.meal]} {t(`meal_${s.meal}` as any)}
                  </div>
                  <MealCard
                    slot={s}
                    onSwap={() => swap(s.day, s.meal, s.recipeId)}
                    onOpen={() => setSelected(localizeRecipe(recipesById[s.recipeId], lang))}
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
          <h2 className="text-xl font-bold">{t("prep_day_title")}</h2>
        </div>
        <p className="text-sm opacity-90 mb-3">{t("prep_day_hint")}</p>
        <ul className="space-y-1.5">
          {prepTasks.map((task) => {
            const localized = localizeRecipe(task.recipe, lang);
            const reasonKey = task.recipe.freezable ? "reason_freezable" : "reason_prepahead";
            return (
              <li key={task.recipe.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-foreground flex-shrink-0" />
                <span>
                  <strong>{localized.title}</strong> — {t(reasonKey as any)}
                </span>
              </li>
            );
          })}
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
