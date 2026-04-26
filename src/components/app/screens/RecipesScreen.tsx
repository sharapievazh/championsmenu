import { useState, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { RecipeImage } from "../RecipeImage";
import { RecipeBadges } from "../RecipeBadges";
import { RecipeDialog } from "../RecipeDialog";
import { Recipe, MealType, RecipeCategory } from "@/types";
import {
  Search,
  LayoutGrid,
  Sunrise,
  Soup,
  Moon,
  Brain,
  Cookie,
  GlassWater,
  Apple,
  Pizza,
} from "lucide-react";

type FilterKey =
  | "all"
  | MealType
  | "brain"
  | RecipeCategory;

const FILTERS: { key: FilterKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "all", label: "Все", icon: LayoutGrid },
  { key: "breakfast", label: "Завтрак", icon: Sunrise },
  { key: "lunch", label: "Обед", icon: Soup },
  { key: "dinner", label: "Ужин", icon: Moon },
  { key: "brain", label: "Для шахматиста", icon: Brain },
  { key: "dessert", label: "Десерты", icon: Cookie },
  { key: "smoothie", label: "Смузи и коктейли", icon: GlassWater },
  { key: "snack", label: "Снеки", icon: Apple },
  { key: "bakery", label: "Выпечка и роллы", icon: Pizza },
];

export function RecipesScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "all") return true;
      if (filter === "brain") return !!r.brainBoost;
      if (filter === "dessert" || filter === "smoothie" || filter === "snack" || filter === "bakery") {
        return r.categories?.includes(filter) ?? false;
      }
      return r.mealTypes.includes(filter);
    });
  }, [filter, q]);

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <h1 className="text-3xl font-bold text-foreground">База рецептов</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {recipes.length} здоровых рецептов · бюджетно · low gluten
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
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            );
          })}
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