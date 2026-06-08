import { useCallback, useEffect, useSyncExternalStore } from "react";
import { MealSlot, PantryItem, Recipe } from "@/types";
import { defaultMenu } from "@/data/defaultMenu";
import { supabase } from "@/integrations/supabase/client";

// v5 — понедельник 1-й недели на завтрак: творожная чаша с клубникой и миндалём.
const MENU_KEY = "cm.menu.v5";
// v5 — кунжут/семена в специи, без тёмного шоколада, яйцо в «остальное», тамари → соевый соус.
const PANTRY_KEY = "cm.pantry.v5";
const CHECKED_KEY = "cm.shopping.checked.v3";
const RATINGS_KEY = "cm.ratings.v1";
const USER_RECIPES_KEY = "cm.userRecipes.v1";

/** Оценка блюда: ❤️ любимое, 👎 не моё, либо без оценки. */
export type RecipeRating = "love" | "dislike";
export type RecipeRatings = Record<string, RecipeRating>;

const EMPTY_PANTRY: PantryItem[] = [];
const EMPTY_CHECKED: Record<string, boolean> = {};
const EMPTY_RATINGS: RecipeRatings = {};
const EMPTY_RECIPES: Recipe[] = [];

type Listener = () => void;

const listenersByKey = new Map<string, Set<Listener>>();
const snapshots = new Map<string, unknown>();

function getListeners(key: string): Set<Listener> {
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  return set;
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getSnapshot<T>(key: string, initial: T): T {
  if (!snapshots.has(key)) {
    snapshots.set(key, readFromStorage(key, initial));
  }
  return snapshots.get(key) as T;
}

function notifyKey(key: string) {
  const set = listenersByKey.get(key);
  if (!set) return;
  set.forEach((l) => l());
}

function useStore<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (listener: Listener) => {
      const set = getListeners(key);
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    [key]
  );

  const getSnap = useCallback(() => getSnapshot<T>(key, initial), [key, initial]);
  const getServerSnap = useCallback(() => initial, [initial]);

  const value = useSyncExternalStore(subscribe, getSnap, getServerSnap);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot<T>(key, initial);
      const computed =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeToStorage(key, computed);
      snapshots.set(key, computed);
      notifyKey(key);
    },
    [key, initial]
  );

  return [value, update] as const;
}

export function useMenu() {
  return useStore<MealSlot[]>(MENU_KEY, defaultMenu);
}
export function usePantry() {
  return useStore<PantryItem[]>(PANTRY_KEY, EMPTY_PANTRY);
}
export function useCheckedItems() {
  return useStore<Record<string, boolean>>(CHECKED_KEY, EMPTY_CHECKED);
}

/**
 * Хранит оценки рецептов: { [recipeId]: "love" | "dislike" }.
 * Используется для подбора недели только из любимых блюд
 * и для быстрой пометки на карточках.
 */
export function useRatings() {
  return useStore<RecipeRatings>(RATINGS_KEY, EMPTY_RATINGS);
}

/**
 * Селектор оценки одного рецепта. Подписка идёт только на изменения
 * RATINGS_KEY, а getSnapshot возвращает примитив ("love" | "dislike" | undefined),
 * что обеспечивает стабильность ссылочного сравнения и предотвращает
 * перерисовку других карточек при смене чужой оценки.
 */
export function useRecipeRating(
  recipeId: string
): readonly [RecipeRating | undefined, (next: RecipeRating) => void] {
  const subscribe = useCallback((listener: Listener) => {
    const set = getListeners(RATINGS_KEY);
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }, []);

  const getSnap = useCallback((): RecipeRating | undefined => {
    const all = getSnapshot<RecipeRatings>(RATINGS_KEY, EMPTY_RATINGS);
    return all[recipeId];
  }, [recipeId]);

  const getServerSnap = useCallback((): RecipeRating | undefined => undefined, []);

  const value = useSyncExternalStore(subscribe, getSnap, getServerSnap);

  const toggle = useCallback(
    (next: RecipeRating) => {
      const prev = getSnapshot<RecipeRatings>(RATINGS_KEY, EMPTY_RATINGS);
      const copy = { ...prev };
      if (copy[recipeId] === next) delete copy[recipeId];
      else copy[recipeId] = next;
      writeToStorage(RATINGS_KEY, copy);
      snapshots.set(RATINGS_KEY, copy);
      notifyKey(RATINGS_KEY);
    },
    [recipeId]
  );

  return [value, toggle] as const;
}

export function useUserRecipes() {
  const [value, setValue] = useStore<Recipe[]>(USER_RECIPES_KEY, EMPTY_RECIPES);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const syncFromCloud = async (userId: string) => {
      const { data, error } = await supabase
        .from("user_recipes")
        .select("recipe_id, data")
        .eq("user_id", userId);
      if (error || !data) return;
      const cloud: Recipe[] = data.map((r) => r.data as unknown as Recipe);
      // Merge: upload any local-only recipes, then set state to cloud union.
      const local = getSnapshot<Recipe[]>(USER_RECIPES_KEY, EMPTY_RECIPES);
      const cloudIds = new Set(cloud.map((r) => r.id));
      const localOnly = local.filter((r) => !cloudIds.has(r.id));
      if (localOnly.length > 0) {
        await supabase.from("user_recipes").upsert(
          localOnly.map((r) => ({ user_id: userId, recipe_id: r.id, data: r as never })),
          { onConflict: "user_id,recipe_id" }
        );
      }
      const merged = [...cloud, ...localOnly];
      writeToStorage(USER_RECIPES_KEY, merged);
      snapshots.set(USER_RECIPES_KEY, merged);
      notifyKey(USER_RECIPES_KEY);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) void syncFromCloud(session.user.id);
    });
    unsub = () => subscription.unsubscribe();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void syncFromCloud(session.user.id);
    });
    return () => unsub?.();
  }, []);

  const setCloudAware = useCallback(
    (next: Recipe[] | ((prev: Recipe[]) => Recipe[])) => {
      const prev = getSnapshot<Recipe[]>(USER_RECIPES_KEY, EMPTY_RECIPES);
      const computed = typeof next === "function" ? (next as (p: Recipe[]) => Recipe[])(prev) : next;
      writeToStorage(USER_RECIPES_KEY, computed);
      snapshots.set(USER_RECIPES_KEY, computed);
      notifyKey(USER_RECIPES_KEY);

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) return;
        const userId = session.user.id;
        const prevIds = new Set(prev.map((r) => r.id));
        const nextIds = new Set(computed.map((r) => r.id));
        const added = computed.filter((r) => !prevIds.has(r.id));
        const updated = computed.filter((r) => prevIds.has(r.id));
        const removed = prev.filter((r) => !nextIds.has(r.id));
        const upserts = [...added, ...updated];
        if (upserts.length > 0) {
          void supabase.from("user_recipes").upsert(
            upserts.map((r) => ({ user_id: userId, recipe_id: r.id, data: r as never })),
            { onConflict: "user_id,recipe_id" }
          );
        }
        if (removed.length > 0) {
          void supabase
            .from("user_recipes")
            .delete()
            .eq("user_id", userId)
            .in("recipe_id", removed.map((r) => r.id));
        }
      });
    },
    []
  );

  return [value, setCloudAware] as const;
}