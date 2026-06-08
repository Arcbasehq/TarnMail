"use client";

import { createContext, useContext, useState, useCallback } from "react";

type SplitViewContextType = {
  selectedThread: string | null;
  setSelectedThread: (threadId: string | null) => void;
};

const SplitViewContext = createContext<SplitViewContextType | null>(null);

export function useSplitView() {
  const ctx = useContext(SplitViewContext);
  if (!ctx) throw new Error("useSplitView must be used within SplitViewProvider");
  return ctx;
}

export function SplitViewProvider({ children }: { children: React.ReactNode }) {
  const [selectedThread, setSelectedThreadState] = useState<string | null>(null);

  const setSelectedThread = useCallback((threadId: string | null) => {
    setSelectedThreadState(threadId);
  }, []);

  return (
    <SplitViewContext.Provider value={{ selectedThread, setSelectedThread }}>
      {children}
    </SplitViewContext.Provider>
  );
}
