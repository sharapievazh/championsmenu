import { Recipe } from "@/types";
import { ImageIcon } from "lucide-react";

export function RecipeImage({
  recipe,
  className = "",
}: {
  recipe: Recipe;
  className?: string;
}) {
  if (!recipe.image) {
    return (
      <div
        className={`bg-muted w-full h-full aspect-square flex flex-col items-center justify-center ${className}`}
      >
        <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
        <span className="text-lg font-semibold text-muted-foreground">
          {recipe.title.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={recipe.image}
      alt={recipe.title}
      loading="lazy"
      decoding="async"
      width={160}
      height={160}
      className={`object-cover w-full h-full aspect-square ${className}`}
    />
  );
}
