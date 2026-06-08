"use client";

import { useEffect, useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { fetchInbox } from "@/app/(app)/inbox/actions";
import type { Conversation } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const IconSearch = ({ className }: { className?: string }) => <i className={`fa-solid fa-magnifying-glass ${className ?? ""}`} aria-hidden />;

export function InboxSidebar() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    fetchInbox()
      .then((rows) => {
        if (!alive) return;
        setItems(
          rows.map((r) => ({
            id: `${r.mailboxId}~${r.threadId}`,
            subject: r.subject,
            participants: [r.from],
            lastMessageAt: r.date,
            preview: r.snippet,
            unread: r.unread,
          })),
        );
      })
      .catch((e) => alive && setError(e?.message ?? "Failed to load"));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (c) =>
        c.subject.toLowerCase().includes(needle) ||
        c.preview.toLowerCase().includes(needle) ||
        c.participants.some((p) => p.toLowerCase().includes(needle)),
    );
  }, [items, q]);

  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-auto shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("inbox.title")}
          </h2>
          {items && (
            <span className="text-xs text-slate-400">{items.length}</span>
          )}
        </div>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search mail"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:bg-white"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            Couldn&apos;t load your inbox. {error}
          </div>
        )}

        {!error && !items && (
          <div className="flex flex-col gap-4 px-4 py-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-2.5 w-2/3 rounded bg-slate-200" />
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && filtered && filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            {q ? "No matching messages." : "Your inbox is empty."}
          </div>
        )}

        {!error && filtered && filtered.length > 0 && (
          <ConversationList items={filtered} />
        )}
      </div>
    </aside>
  );
}
