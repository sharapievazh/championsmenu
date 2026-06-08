import { useState, useMemo, useEffect, useRef } from "react";
import { usePantry } from "@/store/useAppStore";
import { ingredientsToPantryItems, suggestFromPantry } from "@/lib/menuUtils";
import { IngredientCategory, PantryItem, Recipe } from "@/types";
import { Plus, Sparkles, Check, Search } from "lucide-react";
import { RecipeDialog } from "../RecipeDialog";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { LangSwitcher } from "@/i18n/LangSwitcher";
import { localizeRecipe, localizeIngredientName } from "@/i18n/recipeTranslations";

const CAT_EMOJI: Record<IngredientCategory, string> = {
  fruit_veg: "🥬", grains: "🌾", meat_fish: "🐟", dairy_alt: "🥛", spices: "🧂", other: "🫙",
};

export function PantryScreen() {
  const { t, lang } = useT();
  const [pantry, setPantry] = usePantry();
  const [q, setQ] = useState("");
  const [suggestion, setSuggestion] = useState<Recipe | null>(null);
  const [openSug, setOpenSug] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    if (pantry.length === 0) {
      seededRef.current = true;
      setPantry(ingredientsToPantryItems());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => pantry.filter((p) => {
      const display = localizeIngredientName(p.name, lang);
      return display.toLowerCase().includes(q.toLowerCase()) ||
             p.name.toLowerCase().includes(q.toLowerCase());
    }),
    [pantry, q, lang]
  );

  const grouped: Record<IngredientCategory, PantryItem[]> = {
    fruit_veg: [], grains: [], meat_fish: [], dairy_alt: [], spices: [], other: [],
  };
  filtered.forEach((p) => grouped[p.category].push(p));

  const toggle = (id: string) =>
    setPantry((items) => items.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p)));

  const addCustom = () => {
    const name = q.trim();
    if (!name) return;
    if (pantry.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error(t("pantry_already_in_list"));
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
      toast.error(t("pantry_not_enough"));
      return;
    }
    setSuggestion(localizeRecipe(r, lang));
    setOpenSug(true);
  };

  const inStockCount = pantry.filter((p) => p.inStock).length;

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">{t("pantry_title")}</h1>
          <LangSwitcher />
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {t("pantry_count", { n: inStockCount })}
        </p>
      </header>

      <div className="mx-4 mt-4 rounded-2xl bg-gradient-mint p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-bold">{t("pantry_what_to_cook")}</h2>
        </div>
        <p className="text-sm opacity-90 mb-3">{t("pantry_suggest_hint")}</p>
        <button
          onClick={onSuggest}
          className="bg-primary-foreground text-primary font-semibold rounded-full px-4 py-2 text-sm hover:opacity-90"
        >
          {t("pantry_suggest_btn")}
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
              placeholder={t("pantry_search_placeholder")}
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={addCustom}
            className="rounded-full bg-primary text-primary-foreground p-2.5 hover:opacity-90"
            aria-label={t("add")}
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
                <span className="text-xl">{CAT_EMOJI[cat]}</span>
                {t(`cat_${cat}` as any)}
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
                      {localizeIngredientName(p.name, lang)}
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
