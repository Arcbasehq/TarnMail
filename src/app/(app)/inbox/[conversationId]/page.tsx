import Link from "next/link";
import { ThreadView } from "@/components/thread/ThreadView";
import { fetchThread } from "@/app/(app)/inbox/actions";
import type { Conversation, Message } from "@/lib/types";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  // conversationId is the unified ref `mailboxId~threadId`.
  const mailboxId = conversationId.split("~")[0];
  const thread = await fetchThread(conversationId);

  const conversation: Conversation = {
    id: conversationId,
    subject: thread.subject,
    participants: thread.participants,
    lastMessageAt: thread.lastMessageAt,
    preview: "",
    unread: false,
  };

  const messages: Message[] = thread.messages.map((m) => ({
    id: m.id,
    senderId: m.mine ? "me" : m.senderEmail,
    senderName: m.senderName,
    senderEmail: m.senderEmail,
    to: m.to,
    body: m.body,
    html: m.html,
    listUnsubscribe: m.listUnsubscribe,
    createdAt: m.createdAt,
    attachments: m.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      sizeBytes: a.sizeBytes,
      mimeType: a.mimeType,
    })),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-5 dark:border-neutral-800">
        <Link
          href="/inbox"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <i className="fa-solid fa-chevron-left h-4 w-4" aria-hidden />
          Back to inbox
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <ThreadView
          conversation={conversation}
          initialMessages={messages}
          initialStarred={thread.starred}
          mailboxId={mailboxId}
        />
      </div>
    </div>
  );
}
