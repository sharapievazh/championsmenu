import { useState, useEffect, useRef } from "react";
import { CalendarDays, BookOpen, ShoppingCart, Refrigerator } from "lucide-react";
import { MenuScreen } from "@/components/app/screens/MenuScreen";
import { RecipesScreen } from "@/components/app/screens/RecipesScreen";
import { ShoppingScreen } from "@/components/app/screens/ShoppingScreen";
import { PantryScreen } from "@/components/app/screens/PantryScreen";
import { PrintView } from "@/components/app/PrintView";
import { useMenu, usePantry } from "@/store/useAppStore";
import { useT, type TKey } from "@/i18n";

type Tab = "menu" | "recipes" | "shopping" | "pantry";

const TABS: { key: Tab; tKey: TKey; icon: typeof CalendarDays }[] = [
  { key: "menu", tKey: "nav_menu", icon: CalendarDays },
  { key: "recipes", tKey: "nav_recipes", icon: BookOpen },
  { key: "shopping", tKey: "nav_shopping", icon: ShoppingCart },
  { key: "pantry", tKey: "nav_pantry", icon: Refrigerator },
];

const Index = () => {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("menu");
  const [menu] = useMenu();
  const [pantry] = usePantry();
  const [printConfig, setPrintConfig] = useState<{
    weeks: (1 | 2 | 3 | 4)[];
    mode: "menu" | "shopping" | "both";
  }>({ weeks: [1], mode: "both" });

  return (
    <div className="min-h-screen bg-gradient-soft pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-2xl">
        <div className="animate-fade-in" key={tab}>
          {tab === "menu" && <MenuScreen onPrint={(weeks) => setPrintConfig({ weeks, mode: "menu" })} />}
          {tab === "recipes" && <RecipesScreen />}
          {tab === "shopping" && <ShoppingScreen onPrint={(weeks) => setPrintConfig({ weeks, mode: "shopping" })} />}
          {tab === "pantry" && <PantryScreen />}
        </div>
      </div>

      <PrintView menu={menu} pantry={pantry} weeks={printConfig.weeks} mode={printConfig.mode} />

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-20 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl grid grid-cols-4">
          {TABS.map((tab_def) => {
            const active = tab === tab_def.key;
            const Icon = tab_def.icon;
            return (
              <button
                key={tab_def.key}
                onClick={() => setTab(tab_def.key)}
                className={`flex flex-col items-center gap-0.5 py-3 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                <span className={`text-[10px] font-semibold ${active ? "" : "font-medium"}`}>
                  {t(tab_def.tKey)}
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
