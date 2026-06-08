"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchInbox,
  starThread,
  archiveThreads,
  trashThreads,
  markThreadsRead,
} from "@/app/(app)/inbox/actions";
import { formatTime } from "@/lib/format";
import { displayName, colorFor } from "@/lib/avatar";
import { SenderAvatar } from "@/components/inbox/SenderAvatar";
import { SearchFilterBar, type SearchFilters } from "@/components/inbox/SearchFilterBar";
import { useSplitView } from "@/components/inbox/SplitViewProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useKeyboardShortcuts, type Shortcut } from "@/hooks/useKeyboardShortcuts";
import type { Folder, InboxRow } from "@/lib/google/gmail";

type FilterMode = "all" | "unread" | "starred";

const FOLDER_TITLE: Record<Folder, string> = {
  inbox: "heroVisual.inbox",
  drafts: "heroVisual.drafts",
  sent: "heroVisual.sent",
  starred: "heroVisual.starred",
  archive: "heroVisual.archive",
  spam: "heroVisual.spam",
  trash: "heroVisual.trash",
  all: "heroVisual.allMail",
};

function isFolder(v: string | null): v is Folder {
  return !!v && v in FOLDER_TITLE;
}

// Address a thread across the unified timeline as `mailboxId~threadId`.
const refOf = (r: InboxRow) => `${r.mailboxId}~${r.threadId}`;
const shortAccount = (email: string) => email.split("@")[0];

const IconStar = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <i className={`${filled ? "fa-solid" : "fa-regular"} fa-star ${className ?? ""}`} aria-hidden />
);
const IconArchive = ({ className }: { className?: string }) => <i className={`fa-solid fa-box-archive ${className ?? ""}`} aria-hidden />;
const IconTrash = ({ className }: { className?: string }) => <i className={`fa-solid fa-trash ${className ?? ""}`} aria-hidden />;
const IconMailOpen = ({ className }: { className?: string }) => <i className={`fa-solid fa-envelope-open ${className ?? ""}`} aria-hidden />;
const IconFilter = ({ className }: { className?: string }) => <i className={`fa-solid fa-filter ${className ?? ""}`} aria-hidden />;

export function InboxList() {
  const { t } = useLanguage();
  const { prefs } = usePrefs();
  const { addToast } = useToast();
  const { setSelectedThread } = useSplitView();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const folder: Folder = isFolder(params.get("folder"))
    ? (params.get("folder") as Folder)
    : isFolder(prefs.defaultFolder)
      ? (prefs.defaultFolder as Folder)
      : "inbox";

  const [rows, setRows] = useState<InboxRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, startAction] = useTransition();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  function navigateList(dir: 1 | -1) {
    if (!filtered || filtered.length === 0) return;
    const next = focusedIndex + dir;
    if (next >= 0 && next < filtered.length) {
      setFocusedIndex(next);
      listItemsRef.current[next]?.scrollIntoView({ block: "nearest" });
    }
  }

  function openFocused() {
    if (focusedIndex >= 0 && filtered && focusedIndex < filtered.length) {
      const ref = refOf(filtered[focusedIndex]);
      if (prefs.splitView) {
        setSelectedThread(ref);
      } else {
        window.location.href = `/inbox/${ref}`;
      }
    }
  }

  function toggleStarFocused() {
    if (focusedIndex >= 0 && filtered && focusedIndex < filtered.length) {
      toggleStar(filtered[focusedIndex]);
    }
  }

  function toggleSelectFocused() {
    if (focusedIndex >= 0 && filtered && focusedIndex < filtered.length) {
      const ref = refOf(filtered[focusedIndex]);
      toggleSelect(ref);
    }
  }

  const [showShortcuts, setShowShortcuts] = useState(false);

  // Reload on folder change or a new search term. The query is sent to the
  // server so it runs as a real provider search (Gmail `q=`) fanned out across
  // every connected mailbox — not a filter of the rows already in memory.
  useEffect(() => {
    let alive = true;
    setRows(null);
    setError(null);
    setSelected(new Set());
    const term = q.trim();

    // Build search query with filters
    let searchQuery = term;
    if (searchFilters.from) {
      searchQuery += ` from:${searchFilters.from}`;
    }
    if (searchFilters.hasAttachment) {
      searchQuery += " has:attachment";
    }
    if (searchFilters.dateRange) {
      const rangeMap: Record<string, string> = {
        today: "newer_than:1d",
        week: "newer_than:7d",
        month: "newer_than:1m",
        year: "newer_than:1y",
      };
      if (rangeMap[searchFilters.dateRange]) {
        searchQuery += ` ${rangeMap[searchFilters.dateRange]}`;
      }
    }

    const run = () =>
      fetchInbox(folder, prefs.messagesPerPage, searchQuery)
        .then((r) => alive && setRows(r))
        .catch((e) => alive && setError(e?.message ?? "Failed to load"));
    // Debounce typed queries; switch folders immediately.
    const timer = setTimeout(run, term || searchQuery ? 300 : 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [folder, prefs.messagesPerPage, q, searchFilters]);

  // Quick filters (unread/starred) stay local; text search is server-side.
  const filtered = useMemo(() => {
    if (!rows) return null;
    return rows.filter((r) => {
      if (filter === "unread" && !r.unread) return false;
      if (filter === "starred" && !r.starred) return false;
      return true;
    });
  }, [rows, filter]);

  // Only tag rows with their account when more than one mailbox is in view.
  const multiAccount = useMemo(
    () => (rows ? new Set(rows.map((r) => r.accountEmail)).size > 1 : false),
    [rows],
  );

  const shortcuts = useMemo<Shortcut[]>(() => [
    { key: "k", meta: true, handler: () => (document.querySelector('input[placeholder*="Search"]') as HTMLElement | null)?.focus(), description: "Focus search", group: "Navigation" },
    { key: "/", handler: () => (document.querySelector('input[placeholder*="Search"]') as HTMLElement | null)?.focus(), description: "Focus search", group: "Navigation" },
    { key: "j", handler: () => navigateList(1), description: "Next message", group: "Navigation" },
    { key: "k", handler: () => navigateList(-1), description: "Previous message", group: "Navigation" },
    { key: "Enter", handler: () => openFocused(), description: "Open message", group: "Navigation" },
    { key: "o", handler: () => openFocused(), description: "Open message", group: "Navigation" },
    { key: "e", handler: () => runBulk(archiveThreads, undefined, "Archived"), description: "Archive selected", group: "Actions" },
    { key: "y", handler: () => runBulk(archiveThreads, undefined, "Archived"), description: "Archive (Gmail style)", group: "Actions" },
    { key: "#", shift: true, handler: () => runBulk(trashThreads, `Delete ${selected.size} conversation${selected.size > 1 ? "s" : ""}?`, "Deleted"), description: "Delete selected", group: "Actions" },
    { key: "Delete", handler: () => runBulk(trashThreads, `Delete ${selected.size} conversation${selected.size > 1 ? "s" : ""}?`, "Deleted"), description: "Delete selected", group: "Actions" },
    { key: "s", handler: () => toggleStarFocused(), description: "Star/unstar focused", group: "Actions" },
    { key: "!", shift: true, handler: () => runBulk(markThreadsRead.bind(null, [...selected], true), undefined, "Marked as read"), description: "Mark as read", group: "Actions" },
    { key: "u", handler: () => runBulk(markThreadsRead.bind(null, [...selected], false), undefined, "Marked as unread"), description: "Mark as unread", group: "Actions" },
    { key: "x", handler: toggleSelectFocused, description: "Select/deselect focused", group: "Selection" },
    { key: "*", shift: true, handler: () => setSelected(new Set(filtered?.map(refOf) ?? [])), description: "Select all", group: "Selection" },
    { key: "Escape", handler: () => { setSelected(new Set()); setFocusedIndex(-1); }, description: "Clear selection", group: "Selection" },
    { key: "c", handler: () => (document.querySelector('[data-onboarding="compose"] button') as HTMLElement | null)?.click(), description: "Compose new", group: "Compose" },
    { key: "g", shift: true, handler: () => {}, description: "Go to folder (g then key)", group: "Folders" },
    { key: "?", shift: true, handler: () => setShowShortcuts(true), description: "Show shortcuts", group: "Help" },
  ], [filtered, selected, busy]);

  useKeyboardShortcuts(shortcuts);

  function toggleStar(row: InboxRow) {
    const ref = refOf(row);
    const current = row.starred;
    setRows((prev) =>
      prev ? prev.map((r) => (refOf(r) === ref ? { ...r, starred: !current } : r)) : prev,
    );
    startAction(async () => {
      try {
        await starThread(ref, !current);
        addToast({
          type: "success",
          title: current ? "Unstarred" : "Starred",
          duration: 2000,
        });
      } catch {
        // revert on failure
        setRows((prev) =>
          prev ? prev.map((r) => (refOf(r) === ref ? { ...r, starred: current } : r)) : prev,
        );
        addToast({
          type: "error",
          title: "Failed to update star",
          duration: 3000,
        });
      }
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!filtered) return;
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map(refOf)),
    );
  }

  function runBulk(fn: (refs: string[]) => Promise<void>, confirmMsg?: string, actionName?: string) {
    const refs = [...selected];
    if (refs.length === 0) return;
    if (confirmMsg && prefs.confirmDelete && !window.confirm(confirmMsg)) return;
    // optimistic remove from view
    setRows((prev) => (prev ? prev.filter((r) => !selected.has(refOf(r))) : prev));
    setSelected(new Set());
    startAction(async () => {
      try {
        await fn(refs);
        if (actionName) {
          addToast({
            type: "success",
            title: `${actionName} ${refs.length === 1 ? "conversation" : `${refs.length} conversations`}`,
          });
        }
      } catch {
        addToast({
          type: "error",
          title: "Action failed",
          message: "Please try again.",
        });
      }
    });
  }

  const allSelected = !!filtered && filtered.length > 0 && selected.size === filtered.length;
  const hasSelection = selected.size > 0;

  return (
    <div className="min-h-0 flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-5 dark:border-neutral-800">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="h-4 w-4 accent-[var(--color-accent)]"
          aria-label="Select all"
        />

        {hasSelection ? (
          <div className="flex items-center gap-1 slide-in" data-onboarding="bulk-actions">
            <span className="mr-2 text-sm font-medium text-slate-600 dark:text-neutral-300">
              {selected.size} selected
            </span>
            <button
              onClick={() => runBulk((ids) => markThreadsRead(ids, true), undefined, "Marked as read")}
              disabled={busy}
              title="Mark as read"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <IconMailOpen className="h-4.5 w-4.5 transition-transform duration-200 hover:rotate-12" />
            </button>
            <button
              onClick={() => runBulk(archiveThreads, undefined, "Archived")}
              disabled={busy}
              title="Archive"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <IconArchive className="h-4.5 w-4.5 transition-transform duration-200 hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() =>
                runBulk(
                  trashThreads,
                  `Delete ${selected.size} conversation${selected.size > 1 ? "s" : ""}?`,
                  "Deleted",
                )
              }
              disabled={busy}
              title="Delete"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 dark:text-neutral-400 dark:hover:bg-red-500/10"
            >
              <IconTrash className="h-4.5 w-4.5 transition-transform duration-200 hover:rotate-6" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold text-slate-900 dark:text-neutral-100 transition-opacity duration-200">
              {q.trim() ? `Search: ${q.trim()}` : t(FOLDER_TITLE[folder])}
            </h1>
            {filtered && <span className="text-sm text-slate-400 dark:text-neutral-500 fade-in">{filtered.length}</span>}
          </>
        )}

        <div className="ml-auto flex items-center gap-2" data-onboarding="filters">
          <SearchFilterBar filters={searchFilters} onChange={setSearchFilters} />
          <button
            onClick={() => setFilter((f) => (f === "unread" ? "all" : "unread"))}
            className={[
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === "unread"
                ? "border-accent bg-accent/10 text-accent"
                : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
            ].join(" ")}
          >
            Unread
          </button>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={[
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                filter === "starred"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              <IconFilter className="h-4 w-4" /> Filter
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40 fade-in" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg scale-in dark:border-neutral-700 dark:bg-neutral-800">
                  {(["all", "unread", "starred"] as FilterMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setFilter(m);
                        setFilterOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm capitalize transition-all duration-150 hover:bg-slate-100 dark:hover:bg-neutral-700",
                        filter === m ? "font-semibold text-accent" : "text-slate-600 dark:text-neutral-300",
                      ].join(" ")}
                    >
                      {m}
                      {filter === m && <i className="fa-solid fa-check h-4 w-4 scale-in" aria-hidden />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error && (
          <div className="m-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            Couldn&apos;t load your mail. {error}
          </div>
        )}

        {!error && !rows && (
          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex pulse-soft items-center gap-4 px-5 py-3.5" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 dark:bg-neutral-800" />
                <div className="h-3 w-40 rounded bg-slate-200 dark:bg-neutral-800" />
                <div className="h-3 flex-1 rounded bg-slate-100 dark:bg-neutral-800/60" />
                <div className="h-3 w-12 rounded bg-slate-100 dark:bg-neutral-800/60" />
              </div>
            ))}
          </div>
        )}

        {!error && filtered && filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-slate-400 dark:text-neutral-500">
            {q || filter !== "all" ? "No matching messages." : "Nothing here."}
          </div>
        )}

                {!error && filtered && filtered.length > 0 && (
                  <ul>
                    {filtered.map((r, index) => {
                      const ref = refOf(r);
                      const sender = displayName(r.from);
                      const checked = selected.has(ref);
                      const bold = r.unread && prefs.unreadBold;
                      const isFocused = focusedIndex === index;
                      const staggerDelay = Math.min(index * 30, 300);
                      return (
                        <li
                          ref={(el) => { listItemsRef.current[index] = el; }}
                          key={ref}
                          style={{ animationDelay: `${staggerDelay}ms` }}
                          className={[
                            "slide-in flex items-center gap-3 border-b border-slate-100 px-5 transition-all duration-200 hover:bg-slate-50 dark:border-neutral-800/70 dark:hover:bg-neutral-800/40",
                            isFocused
                              ? "bg-accent/5 ring-1 ring-accent/20 dark:bg-accent/10"
                              : checked
                              ? "bg-accent/5 dark:bg-accent/10"
                              : r.unread
                              ? "bg-white dark:bg-neutral-900/30"
                              : "bg-slate-50/40 dark:bg-transparent",
                          ].join(" ")}
                        >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelect(ref)}
                    className="h-4 w-4 shrink-0 accent-[var(--color-accent)] transition-transform duration-150 hover:scale-110 active:scale-90"
                    aria-label="Select"
                  />

                  <button
                    type="button"
                    onClick={() => toggleStar(r)}
                    className={[
                      "shrink-0 transition-all duration-200",
                      r.starred ? "text-amber-400 scale-110" : "text-slate-300 hover:text-slate-400 hover:scale-110",
                    ].join(" ")}
                    aria-label="Star"
                  >
                    <IconStar className="h-4.5 w-4.5 transition-transform duration-200" filled={r.starred} />
                  </button>

                  <Link
                    href={`/inbox/${ref}`}
                    className={[
                      "flex min-w-0 flex-1 items-center gap-3",
                      prefs.density === "compact" ? "py-1.5" : "py-3",
                    ].join(" ")}
                    onClick={(e) => {
                      if (prefs.splitView) {
                        e.preventDefault();
                        setSelectedThread(ref);
                      }
                    }}
                  >
                    {prefs.showAvatars && (
                      <SenderAvatar from={r.from} sender={sender} showFavicons={prefs.showFavicons} />
                    )}

                    <span
                      className={[
                        "w-48 shrink-0 truncate text-sm",
                        bold ? "font-semibold text-slate-900 dark:text-neutral-100" : "text-slate-600 dark:text-neutral-400",
                      ].join(" ")}
                    >
                      {sender}
                    </span>

                    <span className="flex min-w-0 flex-1 items-baseline gap-2">
                      {multiAccount && (
                        <span
                          className={["shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", colorFor(r.accountEmail)].join(" ")}
                          title={r.accountEmail}
                        >
                          {shortAccount(r.accountEmail)}
                        </span>
                      )}
                      <span
                        className={[
                          "truncate text-sm",
                          bold ? "font-semibold text-slate-900 dark:text-neutral-100" : "text-slate-500 dark:text-neutral-400",
                        ].join(" ")}
                      >
                        {r.subject || "(no subject)"}
                      </span>
                      {prefs.showSnippets && (
                        <span className="truncate text-sm text-slate-400 dark:text-neutral-500">{r.snippet}</span>
                      )}
                    </span>

                    {r.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent pulse-soft" />}
                    <span
                      className={[
                        "w-20 shrink-0 text-right text-xs",
                        bold ? "font-semibold text-slate-700 dark:text-neutral-300" : "text-slate-400 dark:text-neutral-500",
                      ].join(" ")}
                    >
                      {formatTime(r.date, prefs.clock12h)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
