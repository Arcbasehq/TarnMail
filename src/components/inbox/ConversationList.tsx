"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { Conversation } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { displayName } from "@/lib/avatar";
import { SenderAvatar } from "@/components/inbox/SenderAvatar";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";

export function ConversationList({ items }: { items: Conversation[] }) {
  const active = useSelectedLayoutSegment();
  const { prefs } = usePrefs();

  return (
    <nav className="flex flex-col">
      {items.map((c) => {
        const isActive = active === c.id;
        const from = c.participants.filter((p) => p !== "me")[0] ?? "You";
        const sender = displayName(from);
        return (
          <Link
            key={c.id}
            href={`/inbox/${c.id}`}
            className={[
              "flex gap-3 border-b border-slate-100 px-4 py-3 transition-colors",
              isActive ? "bg-accent/10" : "hover:bg-slate-50",
            ].join(" ")}
          >
            {prefs.showAvatars && (
              <SenderAvatar from={from} sender={sender} showFavicons={prefs.showFavicons} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={[
                    "truncate text-sm",
                    c.unread ? "font-semibold text-slate-900" : "font-medium text-slate-700",
                  ].join(" ")}
                >
                  {sender}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatTime(c.lastMessageAt, prefs.clock12h)}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className={[
                    "truncate text-sm",
                    c.unread ? "text-slate-900" : "text-slate-500",
                  ].join(" ")}
                >
                  {c.subject || "(no subject)"}
                </span>
                {c.unread && (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
              </div>

              <p className="mt-0.5 truncate text-xs text-slate-400">{c.preview}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
