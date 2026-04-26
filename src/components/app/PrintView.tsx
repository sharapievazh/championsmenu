import { MealSlot, PantryItem } from "@/types";
import { recipesById } from "@/data/recipes";
import { DAYS, MEAL_LABELS } from "@/data/defaultMenu";
import { buildShoppingList, CATEGORY_LABELS } from "@/lib/menuUtils";

interface PrintViewProps {
  menu: MealSlot[];
  pantry: PantryItem[];
  weeks: (1 | 2 | 3 | 4)[];
  mode: "menu" | "shopping" | "both";
}

/**
 * Скрытый блок для печати. Показывается только в @media print.
 * Содержит компактное расписание готовки и/или список покупок
 * по выбранным неделям. Печатается через window.print().
 */
export function PrintView({ menu, pantry, weeks, mode }: PrintViewProps) {
  return (
    <div className="print-only" aria-hidden>
      <div className="print-header">
        <h1>Меню Чемпиона</h1>
        <p>
          {mode === "shopping"
            ? "Список покупок"
            : mode === "menu"
            ? "Расписание готовки"
            : "Меню и покупки"}{" "}
          · {weeks.length === 1 ? `Неделя ${weeks[0]}` : `Недели ${weeks.join(", ")}`}
        </p>
      </div>

      {(mode === "menu" || mode === "both") &&
        weeks.map((w) => {
          const wm = menu.filter((s) => s.week === w);
          return (
            <section key={`menu-${w}`} className="print-section">
              <h2>Неделя {w} — расписание готовки</h2>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>День</th>
                    <th>Завтрак</th>
                    <th>Обед</th>
                    <th>Ужин</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((d) => {
                    const slots = wm.filter((s) => s.day === d.key);
                    const get = (m: "breakfast" | "lunch" | "dinner") =>
                      recipesById[slots.find((s) => s.meal === m)?.recipeId ?? ""]?.title ?? "—";
                    return (
                      <tr key={d.key}>
                        <td className="print-day">{d.label}</td>
                        <td>{get("breakfast")}</td>
                        <td>{get("lunch")}</td>
                        <td>{get("dinner")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}

      {(mode === "shopping" || mode === "both") &&
        weeks.map((w) => {
          const wm = menu.filter((s) => s.week === w);
          const grouped = buildShoppingList(wm, pantry, {});
          const cats = Object.keys(grouped) as (keyof typeof grouped)[];
          const total = cats.reduce((n, c) => n + grouped[c].length, 0);
          return (
            <section key={`shop-${w}`} className="print-section">
              <h2>
                Неделя {w} — список покупок{" "}
                <span className="print-muted">· {total} позиций</span>
              </h2>
              {cats
                .filter((c) => grouped[c].length > 0)
                .map((c) => (
                  <div key={c} className="print-cat">
                    <h3>{CATEGORY_LABELS[c]}</h3>
                    <ul className="print-list">
                      {grouped[c].map((it) => (
                        <li key={it.key}>
                          <span className="print-check">☐</span> {it.name}{" "}
                          <span className="print-amount">
                            — {it.amount} {it.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </section>
          );
        })}

      <p className="print-footer">Сгенерировано в приложении «Меню Чемпиона»</p>
    </div>
  );
}

// Подсказка по используемым лейблам, чтобы tree-shaker не выкинул:
void MEAL_LABELS;