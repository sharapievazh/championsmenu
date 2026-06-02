import { useState, useRef, memo } from "react";
import { MealSlot } from "@/types";
import { recipesById } from "@/data/recipes";
import { RecipeImage } from "./RecipeImage";
import { RecipeBadges } from "./RecipeBadges";
import { RefreshCw, Heart, ThumbsDown } from "lucide-react";
import { useRatings } from "@/store/useAppStore";
import { useT } from "@/i18n";
import { localizeRecipe } from "@/i18n/recipeTranslations";

interface Props {
  slot: MealSlot;
  onSwap: () => void;
  onOpen: () => void;
}

export const MealCard = memo(function MealCard({ slot, onSwap, onOpen }: Props) {
  const { t, lang } = useT();
  const recipeRaw = recipesById[slot.recipeId];
  const [dragX, setDragX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const [ratings, setRatings] = useRatings();

  if (!recipeRaw) return null;
  const recipe = localizeRecipe(recipeRaw, lang);

  const rating = ratings[recipe.id];
  const toggleRating = (next: "love" | "dislike") => {
    setRatings((prev) => {
      const copy = { ...prev };
      if (copy[recipe.id] === next) delete copy[recipe.id];
      else copy[recipe.id] = next;
      return copy;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setSwiping(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!swiping) return;
    setDragX(Math.min(0, e.clientX - startX.current));
  };
  const onPointerUp = () => {
    setSwiping(false);
    if (dragX < -100) onSwap();
    setDragX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-end pr-6 bg-gradient-mint text-primary-foreground font-semibold">
        <RefreshCw className="h-5 w-5 mr-2" /> {t("swap")}
      </div>
      <div
        className="relative bg-card rounded-2xl shadow-soft hover:shadow-card transition-shadow cursor-pointer touch-pan-y select-none"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: swiping ? "none" : "transform 0.3s var(--ease-out)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => Math.abs(dragX) < 5 && onOpen()}
      >
        <div className="flex gap-3 p-3">
          <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <RecipeImage recipe={recipeRaw} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {recipe.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {recipe.nutrition.kcalAdult} {t("kcal")} · {recipe.nutrition.kcalChild} {t("for_kids_short")}
            </p>
            <div className="mt-1.5">
              <RecipeBadges recipe={recipe} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 self-start">
            <button
              className={`p-1.5 rounded-full transition-colors ${
                rating === "love" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={(e) => { e.stopPropagation(); toggleRating("love"); }}
              aria-label={t("loved")}
              aria-pressed={rating === "love"}
            >
              <Heart className={`h-4 w-4 ${rating === "love" ? "fill-current" : ""}`} />
            </button>
            <button
              className={`p-1.5 rounded-full transition-colors ${
                rating === "dislike" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={(e) => { e.stopPropagation(); toggleRating("dislike"); }}
              aria-label={t("disliked")}
              aria-pressed={rating === "dislike"}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); onSwap(); }}
              aria-label={t("swap_dish")}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
