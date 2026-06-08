"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type AltchaWidgetHandle = { reset: () => void };

type AltchaState = "unverified" | "verifying" | "verified" | "error" | "expired";

export function AltchaWidget({
  onVerified,
  onReset,
  ref,
}: {
  onVerified: (payload: string) => void;
  onReset?: () => void;
  ref?: Ref<AltchaWidgetHandle>;
}) {
  const elRef = useRef<HTMLElement>(null);

  // Register the <altcha-widget> custom element (client-only).
  useEffect(() => {
    import("altcha");
  }, []);

  useImperativeHandle(ref, () => ({
    reset() {
      // The widget exposes a `reset()` method on its element instance.
      (elRef.current as unknown as { reset?: () => void })?.reset?.();
    },
  }));

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as {
        state: AltchaState;
        payload?: string;
      };
      if (detail.state === "verified" && detail.payload) {
        onVerified(detail.payload);
      } else if (detail.state === "expired" || detail.state === "error") {
        onReset?.();
      }
    };
    el.addEventListener("statechange", handler);
    return () => el.removeEventListener("statechange", handler);
  }, [onVerified, onReset]);

  return (
    <altcha-widget
      ref={elRef}
      challengeurl="/api/altcha"
      hidefooter
      hidelogo
    />
  );
}
