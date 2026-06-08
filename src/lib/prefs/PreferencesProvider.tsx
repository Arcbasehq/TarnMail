"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { loadServerPrefs, saveServerPrefs } from "./actions";

export type Density = "comfortable" | "compact";
export type FontSize = "sm" | "base" | "lg";
export type Theme = "light" | "dark" | "system";

export type Preferences = {
  /* Appearance */
  theme: Theme;
  accent: string;
  accentDark: string;
  density: Density;
  fontSize: FontSize;
  showAvatars: boolean;
  showFavicons: boolean;
  showSnippets: boolean;
  unreadBold: boolean;
  clock12h: boolean;
  showFolderCounts: boolean;
  splitView: boolean;

  /* Privacy */
  blockRemoteImages: boolean;
  stripTrackingParams: boolean;
  openLinksNewTab: boolean;
  markReadOnOpen: boolean;

  /* Security */
  confirmDelete: boolean;
  confirmSend: boolean;
  warnExternalLinks: boolean;
  confirmUnsubscribe: boolean;
  hideSenderEmail: boolean;

  /* Mail */
  messagesPerPage: number;
  signature: string;
  defaultFolder: string;
};

export const ACCENTS: { name: string; accent: string; dark: string }[] = [
  { name: "Blue", accent: "#1a73e8", dark: "#1664c8" },
  { name: "Indigo", accent: "#4f46e5", dark: "#4338ca" },
  { name: "Violet", accent: "#7c3aed", dark: "#6d28d9" },
  { name: "Teal", accent: "#0d9488", dark: "#0f766e" },
  { name: "Emerald", accent: "#059669", dark: "#047857" },
  { name: "Rose", accent: "#e11d48", dark: "#be123c" },
  { name: "Amber", accent: "#d97706", dark: "#b45309" },
  { name: "Slate", accent: "#475569", dark: "#334155" },
];

export const FONT_PX: Record<FontSize, string> = {
  sm: "15px",
  base: "16px",
  lg: "18px",
};

const DEFAULTS: Preferences = {
  theme: "light",
  accent: "#1a73e8",
  accentDark: "#1664c8",
  density: "comfortable",
  fontSize: "base",
  showAvatars: true,
  showFavicons: false,
  showSnippets: true,
  unreadBold: true,
  clock12h: true,
  showFolderCounts: true,
  splitView: false,

  blockRemoteImages: true,
  stripTrackingParams: true,
  openLinksNewTab: true,
  markReadOnOpen: true,

  confirmDelete: true,
  confirmSend: false,
  warnExternalLinks: false,
  confirmUnsubscribe: true,
  hideSenderEmail: false,

  messagesPerPage: 30,
  signature: "",
  defaultFolder: "inbox",
};

const STORAGE_KEY = "tarnmail.prefs";

type Ctx = {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  reset: () => void;
};

const PrefsCtx = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  // Suppress server writes while we're applying values that came *from* the
  // server during initial hydration (avoids a pointless echo write).
  const hydrating = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate on mount: localStorage first for an instant paint, then the
  // server copy (source of truth) so settings follow the user across devices.
  // Signed-out visitors (marketing pages) get null from the server and keep
  // the local/default values.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    let cancelled = false;
    loadServerPrefs()
      .then((remote) => {
        if (cancelled || !remote) return;
        const merged = { ...DEFAULTS, ...remote } as Preferences;
        setPrefs(merged);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* offline or signed out — local/default values stand */
      })
      .finally(() => {
        if (!cancelled) hydrating.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply global visual prefs to <html>.
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty("--accent", prefs.accent);
    el.style.setProperty("--accent-dark", prefs.accentDark);
    el.style.fontSize = FONT_PX[prefs.fontSize] ?? FONT_PX.base;
  }, [prefs.accent, prefs.accentDark, prefs.fontSize]);

  // Apply dark mode (light | dark | follow system).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = prefs.theme === "dark" || (prefs.theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (prefs.theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [prefs.theme]);

  const persist = useCallback((next: Preferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    // Don't echo server-sourced values back during hydration.
    if (hydrating.current) return;
    // Debounce: toggling several settings quickly collapses to one write.
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveServerPrefs(next as unknown as Record<string, unknown>);
    }, 600);
  }, []);

  const setPref = useCallback<Ctx["setPref"]>(
    (key, value) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setPrefs(DEFAULTS);
    persist(DEFAULTS);
  }, [persist]);

  return (
    <PrefsCtx.Provider value={{ prefs, setPref, reset }}>{children}</PrefsCtx.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsCtx);
  if (!ctx) throw new Error("usePrefs must be used within PreferencesProvider");
  return ctx;
}
