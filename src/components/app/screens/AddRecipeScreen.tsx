import { useState, type ChangeEvent } from "react";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { IngredientCategory } from "@/types";

type Unit = "г" | "мл" | "шт" | "ст.л." | "ч.л.";

const UNITS: Unit[] = ["г", "мл", "шт", "ст.л.", "ч.л."];

const CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: "fruit_veg", label: "Овощи и фрукты" },
  { value: "grains", label: "Крупы и злаки" },
  { value: "meat_fish", label: "Мясо и рыба" },
  { value: "dairy_alt", label: "Молочное" },
  { value: "spices", label: "Специи" },
  { value: "other", label: "Прочее" },
];

type IngredientRow = {
  name: string;
  amount: string;
  unit: Unit;
  category: IngredientCategory;
};

const emptyIngredient = (): IngredientRow => ({
  name: "",
  amount: "",
  unit: "г",
  category: "other",
});

export function AddRecipeScreen() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [prepMin, setPrepMin] = useState("");
  const [bakeMin, setBakeMin] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const updateIngredient = (idx: number, patch: Partial<IngredientRow>) => {
    setIngredients((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, emptyIngredient()]);
  const removeIngredient = (idx: number) =>
    setIngredients((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const updateStep = (idx: number, value: string) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? value : s)));
  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (idx: number) =>
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="px-4 py-6 pb-24 space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Новый рецепт</h1>
        <p className="text-sm text-muted-foreground">Добавьте своё блюдо в коллекцию</p>
      </header>

      {/* Title */}
      <section className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-2">
        <label className="text-sm font-semibold">Название рецепта</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например, паста с томатами"
          className={inputCls}
        />
      </section>

      {/* Photo */}
      <section className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <label className="text-sm font-semibold">Фото (необязательно)</label>
        {photo ? (
          <div className="space-y-2">
            <img
              src={photo}
              alt="Превью рецепта"
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Удалить фото
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Выбрать изображение</span>
            <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
          </label>
        )}
      </section>

      {/* Ingredients */}
      <section className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Ингредиенты</h2>
          <span className="text-xs text-muted-foreground">{ingredients.length} шт.</span>
        </div>

        <div className="space-y-3">
          {ingredients.map((row, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-background/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                  placeholder="Ингредиент"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  disabled={ingredients.length <= 1}
                  className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition"
                  aria-label="Удалить ингредиент"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={row.amount}
                  onChange={(e) => updateIngredient(idx, { amount: e.target.value })}
                  placeholder="Кол-во"
                  className={inputCls}
                />
                <select
                  value={row.unit}
                  onChange={(e) => updateIngredient(idx, { unit: e.target.value as Unit })}
                  className={inputCls}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <select
                  value={row.category}
                  onChange={(e) =>
                    updateIngredient(idx, { category: e.target.value as IngredientCategory })
                  }
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition"
        >
          <Plus className="h-4 w-4" />
          Добавить ингредиент
        </button>
      </section>

      {/* Steps */}
      <section className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Шаги приготовления</h2>
          <span className="text-xs text-muted-foreground">{steps.length} шт.</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="shrink-0 mt-2 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => updateStep(idx, e.target.value)}
                placeholder={`Шаг ${idx + 1}`}
                rows={2}
                className={`${inputCls} resize-none`}
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                disabled={steps.length <= 1}
                className="shrink-0 mt-1 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition"
                aria-label="Удалить шаг"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition"
        >
          <Plus className="h-4 w-4" />
          Добавить шаг
        </button>
      </section>

      {/* Times */}
      <section className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <h2 className="text-sm font-semibold">Время приготовления</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Подготовка, мин</span>
            <input
              type="number"
              inputMode="numeric"
              value={prepMin}
              onChange={(e) => setPrepMin(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">В духовке, мин</span>
            <input
              type="number"
              inputMode="numeric"
              value={bakeMin}
              onChange={(e) => setBakeMin(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </label>
        </div>
      </section>

      {/* Save (visual stub) */}
      <button
        type="button"
        className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold shadow-sm hover:opacity-90 transition"
      >
        Сохранить рецепт
      </button>
    </div>
  );
}
