import { useMemo, useState } from "react";
import { useMenu, usePantry, useCheckedItems } from "@/store/useAppStore";
import { buildShoppingList, CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/menuUtils";
import { IngredientCategory } from "@/types";
import { Check, Printer } from "lucide-react";

interface ShoppingScreenProps {
  onPrint?: (weeks: (1 | 2 | 3 | 4)[]) => void;
}

export function ShoppingScreen({ onPrint }: ShoppingScreenProps = {}) {
  const [menu] = useMenu();
  const [pantry] = usePantry();
  const [checked, setChecked] = useCheckedItems();
  const [week, setWeek] = useState<1 | 2 | 3 | 4>(1);

  const weekMenu = useMemo(() => menu.filter((s) => s.week === week), [menu, week]);

  const grouped = useMemo(
    () => buildShoppingList(weekMenu, pantry, checked),
    [weekMenu, pantry, checked]
  );

  const allItems = (Object.values(grouped) as any[]).flat();
  const checkedCount = allItems.filter((i: any) => i.checked).length;

  const toggle = (key: string) =>
    setChecked((c) => ({ ...c, [key]: !c[key] }));

  const cats = Object.keys(grouped) as IngredientCategory[];

  const handlePrint = (scope: "current" | "all") => {
    const weeks = scope === "current" ? [week] : ([1, 2, 3, 4] as const);
    onPrint?.(weeks as (1 | 2 | 3 | 4)[]);
    setTimeout(() => window.print(), 60);
  };

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">Список покупок</h1>
          <button
            onClick={() => handlePrint("current")}
            className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft hover:bg-muted transition-colors"
            aria-label="Распечатать список покупок"
          >
            <Printer className="h-3.5 w-3.5" /> Печать
          </button>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {checkedCount} из {allItems.length} куплено
        </p>
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
              Неделя {w}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePrint("all")}
          className="block mt-2 ml-2 text-xs text-primary font-semibold hover:underline"
        >
          Распечатать список на все 4 недели →
        </button>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-mint transition-all"
            style={{ width: `${allItems.length ? (checkedCount / allItems.length) * 100 : 0}%` }}
          />
        </div>
      </header>

      <div className="px-4 mt-5 space-y-5">
        {cats
          .filter((c) => grouped[c].length > 0)
          .map((cat) => (
            <section key={cat}>
              <h2 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-xl">{CATEGORY_EMOJI[cat]}</span>
                {CATEGORY_LABELS[cat]}
                <span className="text-xs text-muted-foreground font-normal">
                  · {grouped[cat].length}
                </span>
              </h2>
              <div className="rounded-2xl bg-card shadow-soft overflow-hidden">
                {grouped[cat].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? "bg-primary border-primary"
                          : "border-border bg-background"
                      }`}
                    >
                      {item.checked && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <span
                      className={`flex-1 text-sm ${
                        item.checked ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.amount} {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}

        {allItems.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Список пуст — всё уже в кладовой.
          </p>
        )}
      </div>
    </div>
  );
}