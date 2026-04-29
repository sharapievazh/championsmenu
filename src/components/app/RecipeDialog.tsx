import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Recipe, IngredientCategory } from "@/types";
import { RecipeBadges } from "./RecipeBadges";
import { Brain } from "lucide-react";
import { useT } from "@/i18n";

const CAT_EMOJI: Record<IngredientCategory, string> = {
  fruit_veg: "🥬", grains: "🌾", meat_fish: "🐟", dairy_alt: "🥛", other: "🫙",
};

export function RecipeDialog({
  recipe, open, onOpenChange,
}: {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useT();
  if (!recipe) return null;
  const gUnit = lang === "en" ? "g" : "г";
  const grouped: Record<IngredientCategory, typeof recipe.ingredients> = {
    fruit_veg: [], grains: [], meat_fish: [], dairy_alt: [], other: [],
  };
  recipe.ingredients.forEach((i) => grouped[i.category].push(i));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
          </DialogHeader>
          <RecipeBadges recipe={recipe} />

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl bg-secondary p-2">
              <div className="text-lg font-bold text-foreground">{recipe.nutrition.kcalAdult}</div>
              <div className="text-[10px] text-muted-foreground">{t("kcal_adult_short")}</div>
            </div>
            <div className="rounded-xl bg-secondary p-2">
              <div className="text-lg font-bold text-foreground">{recipe.nutrition.kcalChild}</div>
              <div className="text-[10px] text-muted-foreground">{t("kcal_child_short")}</div>
            </div>
            <div className="rounded-xl bg-secondary p-2">
              <div className="text-lg font-bold text-foreground">{recipe.nutrition.protein}{gUnit}</div>
              <div className="text-[10px] text-muted-foreground">{t("protein_short")}</div>
            </div>
            <div className="rounded-xl bg-secondary p-2">
              <div className="text-lg font-bold text-foreground">{recipe.nutrition.carbs}{gUnit}</div>
              <div className="text-[10px] text-muted-foreground">{t("carbs_short")}</div>
            </div>
          </div>

          {recipe.brainNote && (
            <div className="rounded-xl bg-brain/10 p-3 flex gap-2">
              <Brain className="h-5 w-5 text-brain flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-brain uppercase">{t("for_chess_player")}</div>
                <p className="text-sm text-foreground mt-0.5">{recipe.brainNote}</p>
              </div>
            </div>
          )}

          {recipe.childFriendlyNote && (
            <div className="rounded-xl bg-accent/15 p-3 text-sm">
              <div className="text-xs font-semibold text-accent-foreground/80 uppercase mb-1">
                {t("for_kids")}
              </div>
              {recipe.childFriendlyNote}
            </div>
          )}

          <section>
            <h3 className="font-semibold text-lg mb-2">
              {t("ingredients_for", { n: recipe.servings })}
            </h3>
            <div className="space-y-3">
              {(Object.keys(grouped) as IngredientCategory[])
                .filter((c) => grouped[c].length > 0)
                .map((cat) => (
                  <div key={cat}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      {CAT_EMOJI[cat]} {t(`cat_${cat}` as any)}
                    </div>
                    <ul className="space-y-1">
                      {grouped[cat].map((i, idx) => (
                        <li key={idx} className="flex justify-between text-sm border-b border-border/50 py-1">
                          <span>{i.name}</span>
                          <span className="text-muted-foreground">{i.amount} {i.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">{t("cooking_steps")}</h3>
            <ol className="space-y-2">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
