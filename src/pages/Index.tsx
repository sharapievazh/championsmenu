import { useState } from "react";
import { CalendarDays, BookOpen, ShoppingCart, Refrigerator } from "lucide-react";
import { MenuScreen } from "@/components/app/screens/MenuScreen";
import { RecipesScreen } from "@/components/app/screens/RecipesScreen";
import { ShoppingScreen } from "@/components/app/screens/ShoppingScreen";
import { PantryScreen } from "@/components/app/screens/PantryScreen";

type Tab = "menu" | "recipes" | "shopping" | "pantry";

const TABS: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
  { key: "menu", label: "Меню", icon: CalendarDays },
  { key: "recipes", label: "Рецепты", icon: BookOpen },
  { key: "shopping", label: "Покупки", icon: ShoppingCart },
  { key: "pantry", label: "Кладовая", icon: Refrigerator },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("menu");

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto max-w-2xl">
        <div className="animate-fade-in" key={tab}>
          {tab === "menu" && <MenuScreen />}
          {tab === "recipes" && <RecipesScreen />}
          {tab === "shopping" && <ShoppingScreen />}
          {tab === "pantry" && <PantryScreen />}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-20 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl grid grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center gap-0.5 py-3 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                <span className={`text-[10px] font-semibold ${active ? "" : "font-medium"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
