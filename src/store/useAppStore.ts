import { useEffect, useState } from "react";
import { MealSlot, PantryItem } from "@/types";
import { defaultMenu } from "@/data/defaultMenu";

const MENU_KEY = "cm.menu.v1";
const PANTRY_KEY = "cm.pantry.v1";
const CHECKED_KEY = "cm.shopping.checked.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Простой реактивный стор на основе подписки на события storage внутри окна.
type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());

function useStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    const l = () => setValue(read(key, initial));
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const computed =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, computed);
      notify();
      return computed;
    });
  };
  return [value, update] as const;
}

export function useMenu() {
  return useStore<MealSlot[]>(MENU_KEY, defaultMenu);
}
export function usePantry() {
  return useStore<PantryItem[]>(PANTRY_KEY, []);
}
export function useCheckedItems() {
  return useStore<Record<string, boolean>>(CHECKED_KEY, {});
}