import type { Attachment } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { fetchAttachment } from "@/app/(app)/inbox/actions";
import { useState } from "react";

export function AttachmentChip({
  attachment,
  mailboxId,
  messageId,
}: {
  attachment: Attachment;
  mailboxId?: string;
  messageId?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function download() {
    if (!mailboxId || !messageId) {
      alert("Attachment download not configured");
      return;
    }
    setLoading(true);
    try {
      const base64 = await fetchAttachment(mailboxId, messageId, attachment.id);
      const byteString = atob(base64);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: attachment.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download attachment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      className="flex max-w-full items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
    >
      <i className="fa-solid fa-paperclip h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
      <span className="truncate font-medium">{attachment.fileName}</span>
      <span className="shrink-0 text-neutral-400">{formatBytes(attachment.sizeBytes)}</span>
    </button>
  );
}
