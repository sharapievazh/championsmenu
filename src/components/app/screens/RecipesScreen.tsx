import { useState, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { RecipeImage } from "../RecipeImage";
import { RecipeBadges } from "../RecipeBadges";
import { RecipeDialog } from "../RecipeDialog";
import { Recipe, MealType } from "@/types";
import { Search } from "lucide-react";

const FILTERS: { key: MealType | "all" | "brain"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "breakfast", label: "Завтрак" },
  { key: "lunch", label: "Обед" },
  { key: "dinner", label: "Ужин" },
  { key: "brain", label: "Для шахматиста" },
];

export function RecipesScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "all") return true;
      if (filter === "brain") return !!r.brainBoost;
      return r.mealTypes.includes(filter);
    });
  }, [filter, q]);

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <h1 className="text-3xl font-bold text-foreground">База рецептов</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {recipes.length} здоровых рецептов · без свинины, low gluten
        </p>
      </header>

      <div className="px-4 mt-4 sticky top-0 bg-background/80 backdrop-blur z-10 pt-1 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти рецепт..."
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className="text-left rounded-2xl bg-card shadow-soft hover:shadow-card transition-all overflow-hidden animate-fade-in"
          >
            <div className="aspect-square bg-muted overflow-hidden">
              <RecipeImage recipe={r} />
            </div>
            <div className="p-3 space-y-1.5">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
                {r.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                {r.nutrition.kcalAdult} ккал
              </div>
              <RecipeBadges recipe={r} />
            </div>
          </button>
        ))}
      </div>

      <RecipeDialog
        recipe={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}