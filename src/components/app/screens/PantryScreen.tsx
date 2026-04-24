import { useState, useMemo, useEffect } from "react";
import { usePantry } from "@/store/useAppStore";
import { ingredientsToPantryItems, suggestFromPantry, CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/menuUtils";
import { IngredientCategory, PantryItem, Recipe } from "@/types";
import { Plus, Sparkles, Check, Search } from "lucide-react";
import { RecipeDialog } from "../RecipeDialog";
import { RecipeImage } from "../RecipeImage";
import { toast } from "sonner";

export function PantryScreen() {
  const [pantry, setPantry] = usePantry();
  const [q, setQ] = useState("");
  const [suggestion, setSuggestion] = useState<Recipe | null>(null);
  const [openSug, setOpenSug] = useState(false);

  // На первый запуск заполнить кладовую списком ингредиентов из всех рецептов (всё «нет в наличии»).
  useEffect(() => {
    if (pantry.length === 0) {
      setPantry(ingredientsToPantryItems());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => pantry.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [pantry, q]
  );

  const grouped: Record<IngredientCategory, PantryItem[]> = {
    fruit_veg: [], grains: [], meat_fish: [], dairy_alt: [], other: [],
  };
  filtered.forEach((p) => grouped[p.category].push(p));

  const toggle = (id: string) =>
    setPantry((items) =>
      items.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );

  const addCustom = () => {
    const name = q.trim();
    if (!name) return;
    if (pantry.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Уже есть в списке");
      return;
    }
    setPantry((items) => [
      ...items,
      { id: name.toLowerCase(), name, category: "other", inStock: true },
    ]);
    setQ("");
  };

  const onSuggest = () => {
    const r = suggestFromPantry(pantry);
    if (!r) {
      toast.error("Отметьте больше продуктов в кладовой");
      return;
    }
    setSuggestion(r);
    setOpenSug(true);
  };

  const inStockCount = pantry.filter((p) => p.inStock).length;

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <h1 className="text-3xl font-bold text-foreground">Кладовая</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {inStockCount} продуктов в наличии
        </p>
      </header>

      <div className="mx-4 mt-4 rounded-2xl bg-gradient-mint p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-bold">Что приготовить?</h2>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Подберём рецепт из того, что есть в кладовой.
        </p>
        <button
          onClick={onSuggest}
          className="bg-primary-foreground text-primary font-semibold rounded-full px-4 py-2 text-sm hover:opacity-90"
        >
          Подобрать рецепт
        </button>
      </div>

      <div className="px-4 mt-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Найти или добавить..."
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={addCustom}
            className="rounded-full bg-primary text-primary-foreground p-2.5 hover:opacity-90"
            aria-label="Добавить"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {(Object.keys(grouped) as IngredientCategory[])
          .filter((c) => grouped[c].length > 0)
          .map((cat) => (
            <section key={cat}>
              <h2 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-xl">{CATEGORY_EMOJI[cat]}</span>
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="rounded-2xl bg-card shadow-soft overflow-hidden">
                {grouped[cat].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/40 text-left"
                  >
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        p.inStock ? "bg-success border-success" : "border-border"
                      }`}
                    >
                      {p.inStock && <Check className="h-3.5 w-3.5 text-success-foreground" />}
                    </div>
                    <span className={`flex-1 text-sm ${p.inStock ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
      </div>

      <RecipeDialog recipe={suggestion} open={openSug} onOpenChange={setOpenSug} />
    </div>
  );
}