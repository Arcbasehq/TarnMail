"use client";

import { useRef, useState } from "react";
import PageHero from "@/components/marketing/PageHero";
import { AltchaWidget, type AltchaWidgetHandle } from "@/components/ui/AltchaWidget";

const ALTCHA_ENABLED = process.env.NEXT_PUBLIC_ALTCHA_ENABLED === "true";

export default function ContactPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<AltchaWidgetHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ALTCHA_ENABLED && !captchaToken) {
      setError("Please complete the captcha");
      return;
    }
    setStatus("loading");
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (captchaToken) formData.append("altcha", captchaToken);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        e.currentTarget.reset();
        captchaRef.current?.reset();
        setCaptchaToken(null);
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        captchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Questions or concerns?"
        subtitle="Pick the right inbox below, or use the form and we will route it for you."
      />

      <section className="mx-auto max-w-6xl gap-12 px-6 py-20 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-slate-900">
            Get in touch
          </h2>

          <p className="mt-4 text-slate-600">
            Support, security questions, partnerships. Pick the right inbox or
            use the form.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-5">
            <label>
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                required
                className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                placeholder="Your name"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                required
                className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">
                Message
              </span>
              <textarea
                name="message"
                required
                rows={5}
                className="mt-1.5 w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                placeholder="How can we help?"
              />
            </label>

            {ALTCHA_ENABLED && (
              <div className="flex justify-center">
                <AltchaWidget
                  ref={captchaRef}
                  onVerified={(payload) => setCaptchaToken(payload)}
                  onReset={() => setCaptchaToken(null)}
                />
              </div>
            )}

            {status === "success" && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                Message sent! We&apos;ll get back to you soon.
              </div>
            )}

            {status === "error" && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
