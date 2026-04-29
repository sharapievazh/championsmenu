import { useState, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { RecipeImage } from "../RecipeImage";
import { RecipeBadges } from "../RecipeBadges";
import { RecipeDialog } from "../RecipeDialog";
import { Recipe, MealType, RecipeCategory } from "@/types";
import { useRatings } from "@/store/useAppStore";
import {
  Search, LayoutGrid, Sunrise, Soup, Moon, Brain,
  Cookie, GlassWater, Apple, Pizza, Heart, ThumbsDown,
} from "lucide-react";
import { useT } from "@/i18n";
import { LangSwitcher } from "@/i18n/LangSwitcher";
import { localizeRecipe } from "@/i18n/recipeTranslations";

type FilterKey = "all" | MealType | "brain" | "favorites" | RecipeCategory;

const FILTERS: { key: FilterKey; tKey: string; icon: typeof LayoutGrid }[] = [
  { key: "all", tKey: "filter_all", icon: LayoutGrid },
  { key: "favorites", tKey: "filter_favorites", icon: Heart },
  { key: "breakfast", tKey: "filter_breakfast", icon: Sunrise },
  { key: "lunch", tKey: "filter_lunch", icon: Soup },
  { key: "dinner", tKey: "filter_dinner", icon: Moon },
  { key: "brain", tKey: "filter_brain", icon: Brain },
  { key: "dessert", tKey: "filter_dessert", icon: Cookie },
  { key: "smoothie", tKey: "filter_smoothie", icon: GlassWater },
  { key: "snack", tKey: "filter_snack", icon: Apple },
  { key: "bakery", tKey: "filter_bakery", icon: Pizza },
];

export function RecipesScreen() {
  const { t, lang } = useT();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [ratings, setRatings] = useRatings();

  const localizedAll = useMemo(
    () => recipes.map((r) => ({ original: r, loc: localizeRecipe(r, lang) })),
    [lang]
  );

  const filtered = useMemo(() => {
    return localizedAll.filter(({ original: r, loc }) => {
      if (q && !loc.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "all") return true;
      if (filter === "favorites") return ratings[r.id] === "love";
      if (filter === "brain") return !!r.brainBoost;
      if (filter === "dessert" || filter === "smoothie" || filter === "snack" || filter === "bakery") {
        return r.categories?.includes(filter) ?? false;
      }
      return r.mealTypes.includes(filter);
    });
  }, [filter, q, ratings, localizedAll]);

  const toggleRating = (id: string, next: "love" | "dislike") => {
    setRatings((prev) => {
      const copy = { ...prev };
      if (copy[id] === next) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  return (
    <div className="pb-24">
      <header className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">{t("recipes_title")}</h1>
          <LangSwitcher />
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {t("recipes_subtitle", { n: recipes.length })}
        </p>
      </header>

      <div className="px-4 mt-4 sticky top-0 bg-background/80 backdrop-blur z-10 pt-1 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("recipes_search_placeholder")}
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
                  active ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(f.tKey as any)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {filtered.map(({ original: r, loc }) => {
          const rating = ratings[r.id];
          return (
            <div
              key={r.id}
              className="relative text-left rounded-2xl bg-card shadow-soft hover:shadow-card transition-all overflow-hidden animate-fade-in"
            >
              <button onClick={() => setSelected(loc)} className="block w-full text-left">
                <div className="aspect-square bg-muted overflow-hidden">
                  <RecipeImage recipe={r} />
                </div>
                <div className="p-3 space-y-1.5">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
                    {loc.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {r.nutrition.kcalAdult} {t("kcal")}
                  </div>
                  <RecipeBadges recipe={r} />
                </div>
              </button>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleRating(r.id, "love"); }}
                  className={`p-1.5 rounded-full backdrop-blur-md shadow-soft transition-colors ${
                    rating === "love" ? "bg-primary text-primary-foreground" : "bg-card/80 text-muted-foreground hover:text-primary"
                  }`}
                  aria-label={t("loved")}
                  aria-pressed={rating === "love"}
                >
                  <Heart className={`h-3.5 w-3.5 ${rating === "love" ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleRating(r.id, "dislike"); }}
                  className={`p-1.5 rounded-full backdrop-blur-md shadow-soft transition-colors ${
                    rating === "dislike" ? "bg-destructive text-destructive-foreground" : "bg-card/80 text-muted-foreground hover:text-destructive"
                  }`}
                  aria-label={t("disliked")}
                  aria-pressed={rating === "dislike"}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <RecipeDialog
        recipe={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
