"use client";

import { useEffect, useState } from "react";
import { useSplitView } from "@/components/inbox/SplitViewProvider";
import { fetchThread } from "@/app/(app)/inbox/actions";
import { ThreadView } from "@/components/thread/ThreadView";
import type { Conversation, Message } from "@/lib/types";

export function ThreadPanel() {
  const { selectedThread } = useSplitView();
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<{
    conversation: Conversation;
    messages: Message[];
    starred: boolean;
    mailboxId: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedThread) {
      setThread(null);
      return;
    }

    setLoading(true);
    fetchThread(selectedThread)
      .then((data) => {
        const mailboxId = selectedThread.split("~")[0];
        const conversation: Conversation = {
          id: selectedThread,
          subject: data.subject,
          participants: data.participants,
          lastMessageAt: data.lastMessageAt,
          preview: "",
          unread: false,
        };

        const messages: Message[] = data.messages.map((m) => ({
          id: m.id,
          senderId: m.mine ? "me" : m.senderEmail,
          senderName: m.senderName,
          senderEmail: m.senderEmail,
          to: m.to,
          body: m.body,
          html: m.html,
          listUnsubscribe: m.listUnsubscribe,
          createdAt: m.createdAt,
          attachments: [],
        }));

        setThread({ conversation, messages, starred: data.starred, mailboxId });
      })
      .finally(() => setLoading(false));
  }, [selectedThread]);

  if (!selectedThread) {
    return (
      <div className="flex h-full w-1/2 items-center justify-center bg-slate-50 dark:bg-neutral-900/50">
        <div className="text-center">
          <i className="fa-solid fa-envelope-open text-4xl text-slate-300 dark:text-neutral-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">
            Select an email to read
          </p>
        </div>
      </div>
    );
  }

  if (loading || !thread) {
    return (
      <div className="flex h-full w-1/2 flex-col bg-white dark:bg-neutral-950">
        <div className="h-14 shrink-0 border-b border-slate-200 dark:border-neutral-800" />
        <div className="flex-1 space-y-4 p-6">
          <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-neutral-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-neutral-800" />
          <div className="space-y-3 pt-4">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-800/60" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-800/60" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-800/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 w-1/2 overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="p-6">
        <ThreadView
          conversation={thread.conversation}
          initialMessages={thread.messages}
          initialStarred={thread.starred}
          mailboxId={thread.mailboxId}
        />
      </div>
    </div>
  );
}
