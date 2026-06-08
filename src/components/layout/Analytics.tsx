"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent/ConsentProvider";

const UMAMI_ID = "06b0ee85-3b42-4aeb-a0b4-6bc4cce82803";

/** Loads umami only after the user allows analytics. */
export default function Analytics() {
  const { analyticsAllowed } = useConsent();

  if (!analyticsAllowed) return null;

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_ID}
      strategy="afterInteractive"
    />
  );
}
