"use client";

import { useEffect, useRef } from "react";

export type ShortcutHandler = (e: KeyboardEvent) => void;

export interface Shortcut {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description: string;
  group: string;
}

function matchShortcut(e: KeyboardEvent, s: Shortcut): boolean {
  if (e.key.toLowerCase() !== s.key.toLowerCase()) return false;
  if (s.shift && !e.shiftKey) return false;
  if (s.ctrl && !e.ctrlKey && !e.metaKey) return false;
  if (s.meta && !e.metaKey && !e.ctrlKey) return false;
  if (s.alt && !e.altKey) return false;
  return true;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  deps: unknown[] = [],
  enabled = true,
) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      for (const s of shortcutsRef.current) {
        if (matchShortcut(e, s)) {
          e.preventDefault();
          s.handler(e);
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, ...deps]);
}

export function getShortcutsList(shortcuts: Shortcut[]) {
  const groups: Record<string, Shortcut[]> = {};
  for (const s of shortcuts) {
    (groups[s.group] ??= []).push(s);
  }
  return groups;
}

export function formatShortcut(s: Shortcut): string {
  const parts: string[] = [];
  if (s.meta) parts.push("⌘");
  if (s.ctrl && !s.meta) parts.push("Ctrl");
  if (s.shift) parts.push("Shift");
  if (s.alt) parts.push("Alt");
  parts.push(s.key.toUpperCase());
  return parts.join(" + ");
}