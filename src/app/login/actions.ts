"use server";

import { signIn } from "@/auth";
import { verifyAltcha, altchaEnabled } from "@/lib/altcha";

export async function signInWithProvider(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  const altchaPayload = String(formData.get("altcha") ?? "");

  if (!provider) {
    throw new Error("Provider is required");
  }

  if (altchaEnabled) {
    if (!altchaPayload) {
      throw new Error("Please complete the captcha");
    }
    const ok = await verifyAltcha(altchaPayload);
    if (!ok) {
      throw new Error("Captcha verification failed");
    }
  }

  await signIn(provider, { redirectTo: callbackUrl || "/inbox" });
}
