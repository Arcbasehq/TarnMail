import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BusinessDashboard from "./BusinessDashboard";
import { getTeamMailboxOverview } from "./actions";

export const metadata: Metadata = {
  title: "Business Dashboard — tarnmail",
  description: "Manage your team, mailboxes, and audit logs.",
};

export default async function BusinessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, email: true },
  });

  if (!user || user.plan !== "BUSINESS") {
    redirect("/pricing");
  }

  let workspace = await prisma.businessWorkspace.findUnique({
    where: { ownerId: session.user.id },
    include: {
      members: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "desc" }],
      },
      audit: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!workspace) {
    workspace = await prisma.businessWorkspace.create({
      data: {
        ownerId: session.user.id,
        name: "My Business",
        members: {
          create: {
            email: user.email ?? "",
            role: "OWNER",
            status: "ACCEPTED",
            userId: session.user.id,
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { name: true, email: true, image: true } },
          },
          orderBy: [{ role: "asc" }, { joinedAt: "desc" }],
        },
        audit: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  }

  // Per-employee mailbox overview (scoped to this workspace). Runs after the
  // workspace is guaranteed to exist so the owner row is always present.
  const memberOverview = await getTeamMailboxOverview();

  return (
    <BusinessDashboard
      workspace={workspace}
      ownerEmail={user.email ?? ""}
      memberOverview={memberOverview}
    />
  );
}
