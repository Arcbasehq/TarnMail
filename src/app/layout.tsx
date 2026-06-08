import type { Metadata } from "next";
import Script from "next/script";
import { Roboto, Roboto_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { PreferencesProvider } from "@/lib/prefs/PreferencesProvider";
import { ConsentProvider } from "@/lib/consent/ConsentProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import CookieBanner from "@/components/layout/CookieBanner";
import Analytics from "@/components/layout/Analytics";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

const body = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = body;

const mono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TarnMail: every inbox, one private window",
  description:
    "Connect Gmail, Outlook and Yahoo. Read and reply to all your mail from one encrypted client. No ad profiling, no content mining, no selling your data.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

function ErrorFallback({
  error,
  resetError,
  componentStack,
}: {
  error: unknown;
  resetError: () => void;
  componentStack: string;
  eventId: string;
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <button
          className="mt-4 rounded bg-accent px-4 py-2 text-accent-foreground"
          onClick={resetError}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var p=JSON.parse(localStorage.getItem('tarnmail.prefs')||'{}');var t=p.theme||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;if(d)e.classList.add('dark');if(p.accent)e.style.setProperty('--accent',p.accent);if(p.accentDark)e.style.setProperty('--accent-dark',p.accentDark);var f={sm:'15px',base:'16px',lg:'18px'}[p.fontSize||'base'];if(f)e.style.fontSize=f;}catch(_){}})();`}
        </Script>
        <Sentry.ErrorBoundary fallback={ErrorFallback}>
          <LanguageProvider>
            <PreferencesProvider>
              <ConsentProvider>
                <ToastProvider>{children}</ToastProvider>
                <CookieBanner />
                <Analytics />
              </ConsentProvider>
            </PreferencesProvider>
          </LanguageProvider>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}
