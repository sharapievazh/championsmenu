import { useLang } from "./index";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full bg-muted p-0.5 text-[11px] font-semibold ${className}`}
    >
      {(["ru", "en"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}