"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/** Per-category consent. `essential` is always on and not stored as a choice. */
export type ConsentCategories = {
  analytics: boolean;
};

export const DEFAULT_CATEGORIES: ConsentCategories = { analytics: false };

const STORAGE_KEY = "tarnmail.consent";

type ConsentContextType = {
  /** Stored choice, or null if the user hasn't decided yet. */
  consent: ConsentCategories | null;
  /** True once we've read localStorage (avoids SSR/hydration flash). */
  ready: boolean;
  /** True only when the user has actively allowed analytics. */
  analyticsAllowed: boolean;
  /** Persist a full set of category choices. */
  save: (c: ConsentCategories) => void;
  /** Re-open the banner so the user can change their choice. */
  reopen: () => void;
};

const ConsentContext = createContext<ConsentContextType | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}

function read(): ConsentCategories | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Back-compat with the earlier "all" | "essential" string format.
    if (raw === "all") return { analytics: true };
    if (raw === "essential") return { analytics: false };
    const parsed = JSON.parse(raw);
    return { analytics: !!parsed?.analytics };
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentCategories | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(read());
    setReady(true);
  }, []);

  const save = useCallback((c: ConsentCategories) => {
    setConsent(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {
      /* storage blocked — keep choice in memory for this session */
    }
  }, []);

  const reopen = useCallback(() => {
    setConsent(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        ready,
        analyticsAllowed: consent?.analytics === true,
        save,
        reopen,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
