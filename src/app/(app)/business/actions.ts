"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { TeamRole, InviteStatus } from "@prisma/client";

async function requireOwner() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user || user.plan !== "BUSINESS") {
    throw new Error("Business plan required");
  }

  return session.user.id;
}

export async function getOrCreateWorkspace() {
  const userId = await requireOwner();

  let workspace = await prisma.businessWorkspace.findUnique({
    where: { ownerId: userId },
    include: {
      members: {
        include: { user: { select: { name: true, email: true, image: true } } },
        orderBy: { joinedAt: "desc" },
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
        ownerId: userId,
        name: "My Business",
        members: {
          create: {
            email: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email ?? "",
            role: "OWNER",
            status: "ACCEPTED",
            userId,
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { name: true, email: true, image: true } } },
          orderBy: { joinedAt: "desc" },
        },
        audit: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  }

  return workspace;
}

export async function inviteMember(formData: FormData) {
  const userId = await requireOwner();
  const workspace = await prisma.businessWorkspace.findUnique({ where: { ownerId: userId } });
  if (!workspace) throw new Error("No workspace");

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Invalid email");

  const existing = await prisma.teamMember.findUnique({
    where: { workspaceId_email: { workspaceId: workspace.id, email } },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") throw new Error("Member already active");
    if (existing.status === "PENDING") throw new Error("Invite already sent");
    await prisma.teamMember.update({
      where: { id: existing.id },
      data: { status: "PENDING", invitedAt: new Date() },
    });
  } else {
    await prisma.teamMember.create({
      data: {
        workspaceId: workspace.id,
        email,
        role: "MEMBER",
        status: "PENDING",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      actorId: userId,
      action: "invite_member",
      target: email,
    },
  });

  redirect("/business");
}

export async function removeMember(formData: FormData) {
  const userId = await requireOwner();
  const workspace = await prisma.businessWorkspace.findUnique({ where: { ownerId: userId } });
  if (!workspace) throw new Error("No workspace");

  const memberId = formData.get("memberId") as string;
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, workspaceId: workspace.id },
  });

  if (!member) throw new Error("Member not found");
  if (member.role === "OWNER") throw new Error("Cannot remove owner");

  await prisma.teamMember.delete({ where: { id: memberId } });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      actorId: userId,
      action: "remove_member",
      target: member.email,
    },
  });

  redirect("/business");
}

export async function changeRole(formData: FormData) {
  const userId = await requireOwner();
  const workspace = await prisma.businessWorkspace.findUnique({ where: { ownerId: userId } });
  if (!workspace) throw new Error("No workspace");

  const memberId = formData.get("memberId") as string;
  const role = formData.get("role") as TeamRole;

  if (!["ADMIN", "MEMBER"].includes(role)) throw new Error("Invalid role");

  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, workspaceId: workspace.id },
  });

  if (!member || member.role === "OWNER") throw new Error("Cannot change owner role");

  await prisma.teamMember.update({
    where: { id: memberId },
    data: { role },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      actorId: userId,
      action: "change_role",
      target: member.email,
      metadata: JSON.stringify({ from: member.role, to: role }),
    },
  });

  redirect("/business");
}

export async function updateWorkspaceName(formData: FormData) {
  const userId = await requireOwner();
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name required");

  await prisma.businessWorkspace.update({
    where: { ownerId: userId },
    data: { name },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: (await prisma.businessWorkspace.findUnique({ where: { ownerId: userId } }))!.id,
      actorId: userId,
      action: "update_workspace_name",
      target: name,
    },
  });

  redirect("/business");
}

/* --------------------------- employee mailboxes --------------------------- */
// A workspace owner needs to see which mailboxes each employee has connected and
// track their provisioning lifecycle (invited → joined → mailbox connected).
// This is scoped strictly to the owner's own workspace members; it never reads
// across other workspaces or exposes tokens — only mailbox metadata. We read
// from the DB (no live provider calls) so the dashboard stays fast and reliable.

export type MemberMailbox = {
  id: string;
  email: string;
  provider: string;
  isPrimary: boolean;
  connectedAt: string;
};

export type MemberOverview = {
  memberId: string;
  name: string | null;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  // true once the invited person has actually signed in (TeamMember.userId set).
  hasAccount: boolean;
  mailboxes: MemberMailbox[];
};

export async function getTeamMailboxOverview(): Promise<MemberOverview[]> {
  const userId = await requireOwner();

  const workspace = await prisma.businessWorkspace.findUnique({
    where: { ownerId: userId },
    include: { members: { include: { user: { select: { name: true } } } } },
  });
  if (!workspace) return [];

  const memberUserIds = workspace.members
    .map((m) => m.userId)
    .filter((id): id is string => Boolean(id));

  const boxes = memberUserIds.length
    ? await prisma.connectedMailbox.findMany({
        where: { userId: { in: memberUserIds } },
        select: {
          id: true,
          userId: true,
          email: true,
          provider: true,
          isPrimary: true,
          createdAt: true,
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const byUser = new Map<string, typeof boxes>();
  for (const b of boxes) {
    const list = byUser.get(b.userId) ?? [];
    list.push(b);
    byUser.set(b.userId, list);
  }

  return workspace.members.map((m) => ({
    memberId: m.id,
    name: m.user?.name ?? null,
    email: m.email,
    role: m.role,
    status: m.status,
    hasAccount: Boolean(m.userId),
    mailboxes: (m.userId ? byUser.get(m.userId) ?? [] : []).map((b) => ({
      id: b.id,
      email: b.email,
      provider: b.provider,
      isPrimary: b.isPrimary,
      connectedAt: b.createdAt.toISOString(),
    })),
  }));
}

export async function resendInvite(formData: FormData) {
  const userId = await requireOwner();
  const workspace = await prisma.businessWorkspace.findUnique({ where: { ownerId: userId } });
  if (!workspace) throw new Error("No workspace");

  const memberId = formData.get("memberId") as string;
  await prisma.teamMember.update({
    where: { id: memberId },
    data: { invitedAt: new Date() },
  });

  redirect("/business");
}
