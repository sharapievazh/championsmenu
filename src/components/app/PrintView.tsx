import { useMemo } from "react";
import { MealSlot, PantryItem } from "@/types";
import { recipesById } from "@/data/recipes";
import { buildShoppingList } from "@/lib/menuUtils";
import { useT } from "@/i18n";
import { localizeRecipe, localizeIngredientName, translateUnit } from "@/i18n/recipeTranslations";

interface PrintViewProps {
  menu: MealSlot[];
  pantry: PantryItem[];
  weeks: (1 | 2 | 3 | 4)[];
  mode: "menu" | "shopping" | "both";
}

const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;

export function PrintView({ menu, pantry, weeks, mode }: PrintViewProps) {
  const { t, lang } = useT();

  const weekData = useMemo(() => {
    return weeks.map((w) => {
      const wm = menu.filter((s) => s.week === w);
      const grouped = (mode === "shopping" || mode === "both")
        ? buildShoppingList(wm, pantry, {})
        : undefined;
      return { w, wm, grouped };
    });
  }, [menu, pantry, weeks, mode, lang]);

  return (
    <div className="print-only" aria-hidden>
      <div className="print-header">
        <h1>{t("print_app_name")}</h1>
        <p>
          {mode === "shopping" ? t("print_shopping") : mode === "menu" ? t("print_menu") : t("print_both")}{" "}
          · {weeks.length === 1 ? t("print_week_one", { n: weeks[0] }) : t("print_weeks_many", { list: weeks.join(", ") })}
        </p>
      </div>

      {(mode === "menu" || mode === "both") &&
        weekData.map(({ w, wm }) => (
          <section key={`menu-${w}`} className="print-section">
            <h2>{t("print_week_schedule", { n: w })}</h2>
            <table className="print-table">
              <thead>
                <tr>
                  <th>{t("print_th_day")}</th>
                  <th>{t("meal_breakfast")}</th>
                  <th>{t("meal_lunch")}</th>
                  <th>{t("meal_dinner")}</th>
                </tr>
              </thead>
              <tbody>
                {DAY_KEYS.map((d) => {
                  const slots = wm.filter((s) => s.day === d);
                  const get = (m: "breakfast" | "lunch" | "dinner") => {
                    const r = recipesById[slots.find((s) => s.meal === m)?.recipeId ?? ""];
                    return r ? localizeRecipe(r, lang).title : "—";
                  };
                  return (
                    <tr key={d}>
                      <td className="print-day">{t(`day_${d}` as any)}</td>
                      <td>{get("breakfast")}</td>
                      <td>{get("lunch")}</td>
                      <td>{get("dinner")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}

      {(mode === "shopping" || mode === "both") &&
        weekData.map(({ w, grouped }) => {
          if (!grouped) return null;
          const cats = Object.keys(grouped) as (keyof typeof grouped)[];
          const total = cats.reduce((n, c) => n + grouped[c].length, 0);
          return (
            <section key={`shop-${w}`} className="print-section">
              <h2>
                {t("print_week_shopping", { n: w })}{" "}
                <span className="print-muted">· {total} {t("print_items")}</span>
              </h2>
              {cats
                .filter((c) => grouped[c].length > 0)
                .map((c) => (
                  <div key={c} className="print-cat">
                    <h3>{t(`cat_${c}` as any)}</h3>
                    <ul className="print-list">
                      {grouped[c].map((it) => (
                        <li key={it.key}>
                          <span className="print-check">☐</span> {localizeIngredientName(it.name, lang)}{" "}
                          <span className="print-amount">— {it.amount} {translateUnit(it.unit, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </section>
          );
        })}

      <p className="print-footer">{t("print_footer")}</p>
    </div>
  );
}
