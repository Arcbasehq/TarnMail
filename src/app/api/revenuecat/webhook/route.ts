import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { planForEvent, verifyWebhookAuth } from "@/lib/billing/revenuecat";

// RevenueCat Web Billing webhook. Authoritatively syncs a user's subscription
// state onto User.plan. Configure the endpoint + Authorization secret in the
// RevenueCat dashboard (REVENUECAT_WEBHOOK_SECRET).
export async function POST(req: NextRequest) {
  if (!verifyWebhookAuth(req.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { event?: { type: string; app_user_id?: string; entitlement_ids?: string[] | null } };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const event = body.event;
  if (!event?.app_user_id || !event.type) {
    return new Response("ok"); // ignore non-actionable events
  }

  const plan = planForEvent(event);
  // app_user_id is the tarnmail User.id; updateMany avoids throwing on no match.
  await prisma.user.updateMany({
    where: { id: event.app_user_id },
    data: { plan },
  });

  return new Response("ok");
}
