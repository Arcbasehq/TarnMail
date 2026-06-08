"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { type Locale, locales, translations } from "./translations";

type LanguageContext = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const Ctx = createContext<LanguageContext | null>(null);

function getInitial(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("locale");
  if (stored === "en" || stored === "fr") return stored as Locale;
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getInitial());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const val = translations[locale]?.[key] ?? translations.en?.[key] ?? key;
      if (!params) return val;
      return val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    },
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
