"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { composeEmail, saveDraft } from "@/app/(app)/inbox/actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePrefs } from "@/lib/prefs/PreferencesProvider";
import { Toast } from "./Toast";

function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  input.files = dt.files;
}

export function Compose({
  className,
  label,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  threadId,
  inReplyTo,
  mailboxId,
  renderTrigger,
}: {
  className?: string;
  label?: string;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  threadId?: string;
  inReplyTo?: string;
  mailboxId?: string;
  renderTrigger?: (open: () => void) => React.ReactNode;
} = {}) {
  const { t } = useLanguage();
  const { prefs } = usePrefs();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const bodyDefault =
    initialBody + (prefs.signature ? `\n\n-- \n${prefs.signature}` : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setMinimized(false);
    setError(null);
    setFiles([]);
    syncInputFiles(fileInputRef.current, []);
  }

  function addFiles(selected: File[]) {
    setFiles((prev) => {
      const next = [...prev, ...selected];
      syncInputFiles(fileInputRef.current, next);
      return next;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      syncInputFiles(fileInputRef.current, next);
      return next;
    });
  }

  function action(formData: FormData) {
    if (prefs.confirmSend && !window.confirm("Send this message?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await composeEmail(formData);
        formRef.current?.reset();
        close();
        setToast("Message sent");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  function handleSaveDraft() {
    if (!formRef.current) return;
    setError(null);
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await saveDraft(formData);
        formRef.current?.reset();
        close();
        router.push("/inbox?folder=drafts");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save draft");
      }
    });
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={
            className ??
            "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
          }
        >
          {label ?? t("inbox.new")}
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-neutral-900 dark:ring-1 dark:ring-neutral-800">
          {/* Title bar */}
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5 dark:bg-neutral-950">
            <h3 className="text-sm font-semibold tracking-tight text-white">
              {t("compose.title")}
            </h3>
            <div className="flex items-center gap-3 text-slate-300">
              <button
                onClick={() => setMinimized((v) => !v)}
                className="text-slate-300 transition-colors hover:text-white"
                aria-label={minimized ? "Expand" : "Minimize"}
              >
                <i
                  className={`fa-solid ${minimized ? "fa-expand" : "fa-minus"} text-xs`}
                  aria-hidden
                />
              </button>
              <button
                onClick={close}
                className="text-slate-300 transition-colors hover:text-white"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark text-sm" aria-hidden />
              </button>
            </div>
          </div>

          {!minimized && (
            <form ref={formRef} action={action} className="px-5 py-2">
              {threadId && <input type="hidden" name="threadId" value={threadId} />}
              {inReplyTo && <input type="hidden" name="inReplyTo" value={inReplyTo} />}
              {mailboxId && <input type="hidden" name="mailboxId" value={mailboxId} />}

              <div className="flex items-center gap-3 border-b border-slate-100 py-3 dark:border-neutral-800">
                <span className="w-16 shrink-0 text-sm text-slate-400 dark:text-neutral-500">
                  {t("compose.to")}
                </span>
                <input
                  name="to"
                  type="email"
                  defaultValue={initialTo}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center gap-3 border-b border-slate-100 py-3 dark:border-neutral-800">
                <span className="w-16 shrink-0 text-sm text-slate-400 dark:text-neutral-500">
                  {t("compose.subject")}
                </span>
                <input
                  name="subject"
                  type="text"
                  defaultValue={initialSubject}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-neutral-100"
                />
              </div>

              <textarea
                name="body"
                rows={6}
                defaultValue={bodyDefault}
                className="w-full resize-none bg-transparent py-3 text-sm text-slate-900 outline-none dark:text-neutral-100"
              />

              {/* Attachments */}
              {files.length > 0 && (
                <ul className="space-y-1.5 pb-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      <i className="fa-solid fa-paperclip text-slate-400" aria-hidden />
                      <span className="flex-1 truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-600"
                        aria-label="Remove attachment"
                      >
                        <i className="fa-solid fa-xmark" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 py-4">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
                >
                  {pending ? t("compose.sending") : t("compose.send")}
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleSaveDraft}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {pending ? t("compose.savingDraft") : t("compose.saveDraft")}
                </button>

                <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800">
                  <i className="fa-solid fa-paperclip" aria-hidden />
                  <span className="sr-only">{t("compose.attach")}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="files"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(Array.from(e.target.files ?? []));
                    }}
                  />
                </label>
              </div>
            </form>
          )}
        </div>
      )}

      <Toast
        message={toast ?? ""}
        visible={!!toast}
        onClose={() => setToast(null)}
      />
    </>
  );
}
