"use client";

import type { Message } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { AttachmentChip } from "./AttachmentChip";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const { t } = useLanguage();
  const { prefs } = usePrefs();

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {!mine && (
        <span className="mb-1 px-1 text-xs font-medium text-neutral-500">
          {message.senderName}
        </span>
      )}
      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          mine
            ? "rounded-br-sm bg-blue-600 text-white"
            : "rounded-bl-sm bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
          message.id.startsWith("tmp") ? "opacity-60" : "",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} />
            ))}
          </div>
        )}
      </div>
      <span className="mt-1 px-1 text-[11px] text-neutral-400">
        {message.id.startsWith("tmp") ? t("thread.sending") : formatTime(message.createdAt, prefs.clock12h)}
      </span>
    </div>
  );
}
