import { Recipe } from "@/types";

export function RecipeImage({
  recipe,
  className = "",
}: {
  recipe: Recipe;
  className?: string;
}) {
  return (
    <img
      src={recipe.image}
      alt={recipe.title}
      loading="lazy"
      className={`object-cover w-full h-full ${className}`}
    />
  );
}