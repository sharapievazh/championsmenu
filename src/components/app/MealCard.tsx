import { useState, useRef } from "react";
import { MealSlot } from "@/types";
import { recipesById } from "@/data/recipes";
import { RecipeImage } from "./RecipeImage";
import { RecipeBadges } from "./RecipeBadges";
import { RefreshCw } from "lucide-react";

interface Props {
  slot: MealSlot;
  onSwap: () => void;
  onOpen: () => void;
}

export function MealCard({ slot, onSwap, onOpen }: Props) {
  const recipe = recipesById[slot.recipeId];
  const [dragX, setDragX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);

  if (!recipe) return null;

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
    if (dragX < -100) {
      onSwap();
    }
    setDragX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-end pr-6 bg-gradient-mint text-primary-foreground font-semibold">
        <RefreshCw className="h-5 w-5 mr-2" /> Заменить
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
            <RecipeImage recipe={recipe} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {recipe.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {recipe.nutrition.kcalAdult} ккал · {recipe.nutrition.kcalChild} для детей
            </p>
            <div className="mt-1.5">
              <RecipeBadges recipe={recipe} />
            </div>
          </div>
          <button
            className="self-start p-2 rounded-full hover:bg-muted text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            aria-label="Заменить блюдо"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}