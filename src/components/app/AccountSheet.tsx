import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AccountSheet() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEmail = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Проверьте почту для подтверждения");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Вы вошли");
        setOpen(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error instanceof Error ? result.error.message : "Ошибка входа");
      setBusy(false);
      return;
    }
    if (!result.redirected) {
      toast.success("Вы вошли");
      setOpen(false);
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли");
    setOpen(false);
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Аккаунт"
          className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition"
        >
          <User className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{user ? "Мой аккаунт" : "Войдите, чтобы сохранять рецепты"}</SheetTitle>
        </SheetHeader>

        {user ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ваши рецепты синхронизируются с облаком и будут доступны на любом устройстве после входа.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground py-2.5 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" /> Выйти
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              После входа ваши рецепты сохраняются в облаке и не теряются при переустановке приложения или смене устройства.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleOAuth("google")}
                disabled={busy}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Войти через Google
              </button>
              <button
                onClick={() => handleOAuth("apple")}
                disabled={busy}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Войти через Apple
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              или email
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputCls}
                autoComplete="email"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className={inputCls}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button
                onClick={handleEmail}
                disabled={busy || !email || password.length < 6}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {mode === "signup" ? "Создать аккаунт" : "Войти"}
              </button>
              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline py-1"
              >
                {mode === "signup" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}