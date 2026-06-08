"use client";

import { useRef, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AltchaWidget, type AltchaWidgetHandle } from "@/components/ui/AltchaWidget";
import { signInWithProvider } from "./actions";
import Google from "@/app/google.svg";
import Microsoft from "@/app/microsoft.svg";

const ALTCHA_ENABLED = process.env.NEXT_PUBLIC_ALTCHA_ENABLED === "true";

export function LoginForm({
  error,
  callbackUrl,
}: {
  error?: string;
  callbackUrl?: string;
}) {
  const { t } = useLanguage();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const altchaRef = useRef<AltchaWidgetHandle>(null);

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: t("login.error.linked"),
    AccessDenied: t("login.error.denied"),
    Configuration: t("login.error.config"),
  };

  const message = error
    ? (errorMessages[error] ?? t("login.error.default"))
    : localError;

  async function handleSubmit(formData: FormData) {
    setLocalError(null);
    if (ALTCHA_ENABLED && !captchaToken) {
      setLocalError("Please complete the captcha first");
      return;
    }
    if (captchaToken) {
      formData.set("altcha", captchaToken);
    }
    setPending(true);
    try {
      await signInWithProvider(formData);
    } catch (e) {
      // Let Next's redirect/notFound control-flow errors propagate — a
      // successful signIn redirects to the OAuth provider via NEXT_REDIRECT.
      unstable_rethrow(e);
      setLocalError(e instanceof Error ? e.message : "Login failed");
      setPending(false);
      altchaRef.current?.reset();
      setCaptchaToken(null);
    }
  }

  return (
    <>
      <h1 className="text-center text-2xl font-medium tracking-tight text-slate-900">
        {t("login.title")}
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        {t("login.subtitle")}
      </p>

      {message && (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="mt-7 space-y-3">
        <ProviderForm
          provider="google"
          label="Google"
          icon={<Image src={Google} alt="Google" width={20} height={20} />}
          callbackUrl={callbackUrl}
          onSubmit={handleSubmit}
          pending={pending}
        />
        <ProviderForm
          provider="microsoft-entra-id"
          label="Microsoft"
          icon={<Image src={Microsoft} alt="Microsoft" width={20} height={20} />}
          callbackUrl={callbackUrl}
          onSubmit={handleSubmit}
          pending={pending}
        />
        <ProviderForm
          provider="yahoo"
          label="Yahoo"
          icon={
            <i
              className="fa-brands fa-yahoo h-5 w-5 text-[#6001D2]"
              aria-hidden
            />
          }
          callbackUrl={callbackUrl}
          onSubmit={handleSubmit}
          pending={pending}
        />
      </div>

      {ALTCHA_ENABLED && (
        <div className="mt-4 flex justify-center">
          <AltchaWidget
            ref={altchaRef}
            onVerified={(payload) => setCaptchaToken(payload)}
            onReset={() => setCaptchaToken(null)}
          />
        </div>
      )}
    </>
  );
}

function ProviderForm({
  provider,
  label,
  icon,
  callbackUrl,
  onSubmit,
  pending,
}: {
  provider: string;
  label: string;
  icon: React.ReactNode;
  callbackUrl?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  pending: boolean;
}) {
  const { t } = useLanguage();

  return (
    <form
      action={async (formData) => {
        formData.set("provider", provider);
        if (callbackUrl) formData.set("callbackUrl", callbackUrl);
        await onSubmit(formData);
      }}
    >
      <input type="hidden" name="provider" value={provider} />
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:shadow-sm disabled:opacity-60"
      >
        {icon}
        {t("login.continueWith", { provider: label })}
      </button>
    </form>
  );
}

export function AgreementText() {
  const { t } = useLanguage();
  return <>{t("login.agreement")}</>;
}
