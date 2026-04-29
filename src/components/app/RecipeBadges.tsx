import { Recipe } from "@/types";
import { Snowflake, Brain, Clock } from "lucide-react";
import { useT } from "@/i18n";

export function RecipeBadges({ recipe }: { recipe: Recipe }) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {recipe.brainBoost && (
        <span className="inline-flex items-center gap-1 rounded-full bg-brain/15 text-brain px-2 py-0.5 text-[11px] font-semibold">
          <Brain className="h-3 w-3" /> {t("badge_brain")}
        </span>
      )}
      {recipe.freezable && (
        <span className="inline-flex items-center gap-1 rounded-full bg-freeze/15 text-freeze px-2 py-0.5 text-[11px] font-semibold">
          <Snowflake className="h-3 w-3" /> {t("badge_freeze")}
        </span>
      )}
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[11px] font-medium">
        <Clock className="h-3 w-3" /> {recipe.timeMin} {t("badge_min")}
      </span>
    </div>
  );
}
