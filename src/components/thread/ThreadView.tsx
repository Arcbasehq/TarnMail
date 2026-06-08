"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Conversation, Message } from "@/lib/types";
import { EmailBody } from "./EmailBody";
import { AttachmentChip } from "./AttachmentChip";
import { Compose } from "@/components/inbox/Compose";
import { formatTime } from "@/lib/format";
import { initials, colorFor } from "@/lib/avatar";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";
import {
  starThread,
  archiveThreads,
  trashThreads,
  markThreadsRead,
  markThreadRead,
} from "@/app/(app)/inbox/actions";

type Props = {
  conversation: Conversation;
  initialMessages: Message[];
  initialStarred?: boolean;
  /** Mailbox this thread belongs to, so replies send from the right account. */
  mailboxId: string;
};

/* ---------------------------------- icons --------------------------------- */
const IconLock = (p: { className?: string }) => <i className={`fa-solid fa-lock ${p.className ?? ""}`} aria-hidden />;
const IconStar = (p: { className?: string; filled?: boolean }) => <i className={`${p.filled ? "fa-solid" : "fa-regular"} fa-star ${p.className ?? ""}`} aria-hidden />;
const IconChevron = (p: { className?: string }) => <i className={`fa-solid fa-chevron-down ${p.className ?? ""}`} aria-hidden />;
const IconMailUnread = (p: { className?: string }) => <i className={`fa-solid fa-envelope ${p.className ?? ""}`} aria-hidden />;
const IconTrash = (p: { className?: string }) => <i className={`fa-solid fa-trash ${p.className ?? ""}`} aria-hidden />;
const IconArchive = (p: { className?: string }) => <i className={`fa-solid fa-box-archive ${p.className ?? ""}`} aria-hidden />;
const IconReply = (p: { className?: string }) => <i className={`fa-solid fa-reply ${p.className ?? ""}`} aria-hidden />;
const IconReplyAll = (p: { className?: string }) => <i className={`fa-solid fa-reply-all ${p.className ?? ""}`} aria-hidden />;
const IconForward = (p: { className?: string }) => <i className={`fa-solid fa-share ${p.className ?? ""}`} aria-hidden />;

/* ------------------------------- helpers ---------------------------------- */
function quote(m: Message): string {
  const who = m.senderName || m.senderEmail || "sender";
  const when = new Date(m.createdAt).toLocaleString();
  return `\n\n\nOn ${when}, ${who} wrote:\n${m.body
    .split("\n")
    .map((l) => "> " + l)
    .join("\n")}`;
}
function reSubject(s: string) {
  return /^re:/i.test(s) ? s : `Re: ${s}`;
}
function fwdSubject(s: string) {
  return /^fwd:/i.test(s) ? s : `Fwd: ${s}`;
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-colors disabled:opacity-50 dark:text-neutral-400",
        danger
          ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          : "hover:bg-slate-100 dark:hover:bg-neutral-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ------------------------------ message card ------------------------------ */
function MessageCard({
  message,
  subject,
  mailboxId,
  defaultOpen,
  active,
  starred,
  onToggleStar,
  onMarkUnread,
  onArchive,
  onTrash,
  busy,
}: {
  message: Message;
  subject: string;
  mailboxId: string;
  defaultOpen: boolean;
  active: boolean;
  starred: boolean;
  onToggleStar: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onTrash: () => void;
  busy: boolean;
}) {
  const { prefs } = usePrefs();
  const [open, setOpen] = useState(defaultOpen);
  const replyEmail = message.senderEmail ?? message.senderId;

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900",
        active
          ? "border-accent shadow-sm ring-1 ring-accent/20"
          : "border-slate-200 dark:border-neutral-800",
      ].join(" ")}
    >
      {/* Header */}
      <div className="bg-slate-50/60 px-5 pt-4 dark:bg-neutral-900/40">
        <div className="flex items-start gap-3">
          {prefs.showAvatars && (
            <span
              className={["mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold", colorFor(message.senderName)].join(" ")}
              aria-hidden
            >
              {initials(message.senderName)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">From</span>
              <IconLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-neutral-500" />
              <span className="min-w-0 text-sm">
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{message.senderName}</span>{" "}
                {message.senderEmail && !prefs.hideSenderEmail && (
                  <span className="break-all text-accent">&lt;{message.senderEmail}&gt;</span>
                )}
              </span>

              <div className="ml-auto flex shrink-0 items-center gap-2 text-slate-400 dark:text-neutral-500">
                <button
                  type="button"
                  onClick={onToggleStar}
                  className={starred ? "text-amber-400" : "hover:text-slate-600 dark:hover:text-neutral-300"}
                  title="Star"
                >
                  <IconStar className="h-4.5 w-4.5" filled={starred} />
                </button>
                <span className="flex items-center gap-1 text-xs">
                  <IconMailUnread className="h-3.5 w-3.5" />
                  {formatTime(message.createdAt, prefs.clock12h)}
                </span>
                <button type="button" onClick={() => setOpen((v) => !v)} title={open ? "Collapse" : "Expand"}>
                  <IconChevron className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {open ? (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">To</span>
                <span className="truncate rounded-md bg-slate-200/70 px-2 py-0.5 text-xs text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {message.to || "you"}
                </span>
              </div>
            ) : (
              <p className="mt-1 truncate text-xs text-slate-400 dark:text-neutral-500">{message.body.slice(0, 120)}</p>
            )}
          </div>
        </div>

        {open && (
          <>
            {/* Mailing list banner */}
            {message.listUnsubscribe && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                <span className="flex items-center gap-2">
                  <IconMailUnread className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                  This message is from a mailing list.
                </span>
                <a
                  href={message.listUnsubscribe}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (prefs.confirmUnsubscribe && !window.confirm("Open the unsubscribe link for this sender?")) {
                      e.preventDefault();
                    }
                  }}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Unsubscribe
                </a>
              </div>
            )}

            {/* Toolbar */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 py-2 dark:border-neutral-800">
              <div className="flex items-center gap-0.5">
                <IconBtn title="Mark as unread" onClick={onMarkUnread} disabled={busy}>
                  <IconMailUnread className="h-4.5 w-4.5" />
                </IconBtn>
                <IconBtn title="Archive" onClick={onArchive} disabled={busy}>
                  <IconArchive className="h-4.5 w-4.5" />
                </IconBtn>
                <IconBtn title="Delete" onClick={onTrash} disabled={busy} danger>
                  <IconTrash className="h-4.5 w-4.5" />
                </IconBtn>
              </div>

              <div className="flex items-center gap-0.5">
                <Compose
                  mailboxId={mailboxId}
                  initialTo={replyEmail}
                  initialSubject={reSubject(subject)}
                  initialBody={quote(message)}
                  renderTrigger={(openModal) => (
                    <IconBtn title="Reply" onClick={openModal}>
                      <IconReply className="h-4.5 w-4.5" />
                    </IconBtn>
                  )}
                />
                <Compose
                  mailboxId={mailboxId}
                  initialTo={[replyEmail, message.to].filter(Boolean).join(", ")}
                  initialSubject={reSubject(subject)}
                  initialBody={quote(message)}
                  renderTrigger={(openModal) => (
                    <IconBtn title="Reply all" onClick={openModal}>
                      <IconReplyAll className="h-4.5 w-4.5" />
                    </IconBtn>
                  )}
                />
                <Compose
                  mailboxId={mailboxId}
                  initialSubject={fwdSubject(subject)}
                  initialBody={quote(message)}
                  renderTrigger={(openModal) => (
                    <IconBtn title="Forward" onClick={openModal}>
                      <IconForward className="h-4.5 w-4.5" />
                    </IconBtn>
                  )}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 dark:border-neutral-800 dark:bg-neutral-900">
          <EmailBody html={message.html ?? ""} text={message.body} />
          {message.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {message.attachments.map((a) => (
                <AttachmentChip
                  key={a.id}
                  attachment={a}
                  mailboxId={mailboxId}
                  messageId={message.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- thread view ------------------------------ */
export function ThreadView({ conversation, initialMessages, initialStarred = false, mailboxId }: Props) {
  const router = useRouter();
  const { prefs } = usePrefs();
  const messages = initialMessages;
  const lastIndex = messages.length - 1;
  const [starred, setStarred] = useState(initialStarred);
  const [busy, startAction] = useTransition();

  // Mark read on open, if enabled.
  useEffect(() => {
    if (prefs.markReadOnOpen) {
      markThreadRead(conversation.id, true).catch(() => {});
    }
  }, [conversation.id, prefs.markReadOnOpen]);

  function toggleStar() {
    const next = !starred;
    setStarred(next);
    startAction(async () => {
      try {
        await starThread(conversation.id, next);
      } catch {
        setStarred(!next);
      }
    });
  }

  function back() {
    router.push("/inbox");
  }

  function markUnread() {
    startAction(async () => {
      await markThreadsRead([conversation.id], false);
      back();
    });
  }
  function archive() {
    startAction(async () => {
      await archiveThreads([conversation.id]);
      back();
    });
  }
  function trash() {
    if (prefs.confirmDelete && !window.confirm("Delete this conversation?")) return;
    startAction(async () => {
      await trashThreads([conversation.id]);
      back();
    });
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
        {conversation.subject || "(no subject)"}
      </h2>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <MessageCard
            key={m.id}
            message={m}
            subject={conversation.subject}
            mailboxId={mailboxId}
            defaultOpen={i === lastIndex}
            active={i === lastIndex}
            starred={starred}
            onToggleStar={toggleStar}
            onMarkUnread={markUnread}
            onArchive={archive}
            onTrash={trash}
            busy={busy}
          />
        ))}
      </div>
    </div>
  );
}
