import { useEffect, useState } from "react";
import { ru } from "./ru";
import { en } from "./en";

export type Lang = "ru" | "en";

const STORAGE_KEY = "cm.lang.v1";

function readLang(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ru" || v === "en") return v;
    const nav = navigator.language?.toLowerCase() ?? "";
    return nav.startsWith("ru") ? "ru" : "en";
  } catch {
    return "ru";
  }
}

const listeners = new Set<() => void>();
let current: Lang = readLang();

if (typeof document !== "undefined") {
  document.documentElement.lang = current;
}

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  } catch {}
  listeners.forEach((l) => l());
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [v, setV] = useState<Lang>(current);
  useEffect(() => {
    const l = () => setV(current);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [v, setLang];
}

export type TKey = keyof typeof ru;

const dicts: Record<Lang, Record<string, string>> = {
  ru: ru as Record<string, string>,
  en: en as Record<string, string>,
};

export function t(key: TKey, lang?: Lang, vars?: Record<string, string | number>): string {
  const l = lang ?? current;
  let str = dicts[l][key as string] ?? dicts.ru[key as string] ?? (key as string);
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
    }
  }
  return str;
}

export function useT() {
  const [lang] = useLang();
  const tr = (key: TKey, vars?: Record<string, string | number>) => t(key, lang, vars);
  return { t: tr, lang };
}