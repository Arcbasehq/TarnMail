import { NextResponse } from "next/server";
import { createAltchaChallenge, altchaEnabled } from "@/lib/altcha";

// Challenges are unique per request and must never be cached.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!altchaEnabled) {
    return NextResponse.json(
      { error: "ALTCHA is not configured" },
      { status: 503 },
    );
  }
  const challenge = await createAltchaChallenge();
  return NextResponse.json(challenge, {
    headers: { "Cache-Control": "no-store" },
  });
}
