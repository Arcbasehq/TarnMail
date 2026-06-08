"use client";

import { useState } from "react";
import {
  inviteMember,
  removeMember,
  changeRole,
  updateWorkspaceName,
  resendInvite,
} from "./actions";
import type { BusinessWorkspace, TeamMember, AuditLog } from "@prisma/client";
import type { MemberOverview } from "./actions";

type Tab = "overview" | "team" | "mailboxes" | "audit" | "settings";

interface Props {
  workspace: BusinessWorkspace & {
    members: (TeamMember & {
      user: { name: string | null; email: string | null; image: string | null } | null;
    })[];
    audit: AuditLog[];
  };
  ownerEmail: string;
  memberOverview: MemberOverview[];
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "fa-solid fa-chart-pie" },
  { id: "team", label: "Team", icon: "fa-solid fa-users" },
  { id: "mailboxes", label: "Mailboxes", icon: "fa-solid fa-envelope-open-text" },
  { id: "audit", label: "Audit Log", icon: "fa-solid fa-clock-rotate-left" },
  { id: "settings", label: "Settings", icon: "fa-solid fa-gear" },
];

const PROVIDER_LABEL: Record<string, string> = {
  google: "Gmail",
  "microsoft-entra-id": "Outlook",
  yahoo: "Yahoo",
};

function providerLabel(p: string): string {
  return PROVIDER_LABEL[p] ?? p;
}

export default function BusinessDashboard({ workspace, ownerEmail, memberOverview }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [editingName, setEditingName] = useState(false);

  const activeMembers = workspace.members.filter((m) => m.status === "ACCEPTED");
  const pendingInvites = workspace.members.filter((m) => m.status === "PENDING");

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Business
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-slate-900">
            {workspace.name}
          </h1>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""}
        </span>
      </div>

      <nav className="mt-8 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <i className={`${t.icon} text-xs`} aria-hidden />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && (
          <OverviewTab
            activeMembers={activeMembers}
            pendingInvites={pendingInvites}
            audit={workspace.audit}
          />
        )}
        {tab === "team" && (
          <TeamTab
            members={workspace.members}
            ownerEmail={ownerEmail}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
          />
        )}
        {tab === "mailboxes" && <MailboxesTab members={memberOverview} />}
        {tab === "audit" && <AuditTab audit={workspace.audit} />}
        {tab === "settings" && (
          <SettingsTab
            workspaceName={workspaceName}
            setWorkspaceName={setWorkspaceName}
            editingName={editingName}
            setEditingName={setEditingName}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  activeMembers,
  pendingInvites,
  audit,
}: {
  activeMembers: TeamMember[];
  pendingInvites: TeamMember[];
  audit: AuditLog[];
}) {
  const stats = [
    { label: "Active members", value: activeMembers.length, icon: "fa-solid fa-users" },
    { label: "Pending invites", value: pendingInvites.length, icon: "fa-solid fa-envelope" },
    { label: "Admins", value: activeMembers.filter((m) => m.role === "ADMIN").length, icon: "fa-solid fa-shield-halved" },
    { label: "Total actions", value: audit.length, icon: "fa-solid fa-list" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <i className={`${s.icon} text-sm`} aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-display tracking-tight text-slate-900">
              {s.value}
            </p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Recent activity
        </h3>
        <div className="mt-4 space-y-2">
          {audit.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            audit.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-slate-400 w-28 shrink-0">
                  {a.createdAt.toLocaleDateString()}
                </span>
                <span className="font-medium text-slate-700">
                  {a.action.replace(/_/g, " ")}
                </span>
                {a.target && (
                  <span className="text-slate-500">— {a.target}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TeamTab({
  members,
  ownerEmail,
  inviteEmail,
  setInviteEmail,
}: {
  members: (TeamMember & {
    user: { name: string | null; email: string | null; image: string | null } | null;
  })[];
  ownerEmail: string;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
}) {
  const active = members.filter((m) => m.status === "ACCEPTED");
  const pending = members.filter((m) => m.status === "PENDING");

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Invite team member
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          They will receive access once they sign in with this email.
        </p>
        <form action={inviteMember} className="mt-4 flex gap-3">
          <input
            type="email"
            name="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="flex-1 rounded-md border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Send invite
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Active members ({active.length})
        </h3>
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {active.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                  {m.user?.name?.[0]?.toUpperCase() ?? m.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {m.user?.name ?? m.email}
                  </p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <form action={changeRole} className="flex items-center gap-2">
                  <input type="hidden" name="memberId" value={m.id} />
                  <select
                    name="role"
                    defaultValue={m.role}
                    disabled={m.role === "OWNER"}
                    className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-50"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  {m.role !== "OWNER" && (
                    <button
                      type="submit"
                      className="text-xs text-accent hover:underline"
                    >
                      Save
                    </button>
                  )}
                </form>
                {m.role !== "OWNER" && (
                  <form action={removeMember}>
                    <input type="hidden" name="memberId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="font-display text-lg tracking-tight text-slate-900">
            Pending invites ({pending.length})
          </h3>
          <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {pending.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.email}</p>
                  <p className="text-xs text-slate-500">
                    Invited {m.invitedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <form action={resendInvite}>
                    <input type="hidden" name="memberId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs text-accent hover:underline"
                    >
                      Resend
                    </button>
                  </form>
                  <form action={removeMember}>
                    <input type="hidden" name="memberId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MailboxesTab({ members }: { members: MemberOverview[] }) {
  const totalMailboxes = members.reduce((n, m) => n + m.mailboxes.length, 0);
  // Skip the owner's own self-row when summarising "employees".
  const employees = members.filter((m) => m.role !== "OWNER");
  const awaitingConnection = employees.filter(
    (m) => m.status === "ACCEPTED" && m.mailboxes.length === 0,
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Connected mailboxes", value: totalMailboxes, icon: "fa-solid fa-envelope-open-text" },
          { label: "Employees", value: employees.length, icon: "fa-solid fa-user-group" },
          { label: "Awaiting mailbox", value: awaitingConnection, icon: "fa-solid fa-hourglass-half" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <i className={`${s.icon} text-sm`} aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-display tracking-tight text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Employee mailboxes
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Mailboxes each member has connected. Invite a member from the Team tab;
          they connect their own mailbox after signing in.
        </p>

        <div className="mt-4 space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">No members yet.</p>
          ) : (
            members.map((m) => (
              <div
                key={m.memberId}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                      {(m.name ?? m.email)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {m.name ?? m.email}
                        {m.role === "OWNER" && (
                          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                  <LifecycleBadge member={m} />
                </div>

                {m.mailboxes.length > 0 && (
                  <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {m.mailboxes.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between px-4 py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{b.email}</span>
                          {b.isPrimary && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{providerLabel(b.provider)}</span>
                          <span>
                            Connected {new Date(b.connectedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Provisioning lifecycle: invited → joined (signed in) → mailbox connected.
function LifecycleBadge({ member }: { member: MemberOverview }) {
  let label: string;
  let cls: string;
  if (member.status === "PENDING") {
    label = "Invited";
    cls = "bg-amber-50 text-amber-700";
  } else if (!member.hasAccount) {
    label = "Awaiting sign-in";
    cls = "bg-slate-100 text-slate-500";
  } else if (member.mailboxes.length === 0) {
    label = "No mailbox yet";
    cls = "bg-slate-100 text-slate-500";
  } else {
    label = `${member.mailboxes.length} mailbox${member.mailboxes.length !== 1 ? "es" : ""}`;
    cls = "bg-emerald-50 text-emerald-700";
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function AuditTab({ audit }: { audit: AuditLog[] }) {
  return (
    <div>
      <h3 className="font-display text-lg tracking-tight text-slate-900">
        Audit log
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Every action taken in this workspace.
      </p>
      <div className="mt-4 space-y-2">
        {audit.length === 0 ? (
          <p className="text-sm text-slate-500">No activity recorded yet.</p>
        ) : (
          audit.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-4 rounded-lg border border-slate-100 bg-white px-5 py-4"
            >
              <span className="mt-0.5 font-mono text-xs text-slate-400 w-24 shrink-0">
                {a.createdAt.toLocaleDateString()} {a.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">
                  {a.action.replace(/_/g, " ")}
                </p>
                {a.target && (
                  <p className="text-xs text-slate-500">{a.target}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsTab({
  workspaceName,
  setWorkspaceName,
  editingName,
  setEditingName,
}: {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  editingName: boolean;
  setEditingName: (v: boolean) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Workspace name
        </h3>
        {editingName ? (
          <form action={updateWorkspaceName} className="mt-4 flex gap-3">
            <input
              type="text"
              name="name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="flex-1 rounded-md border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="rounded-md border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:border-accent/50"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-700">{workspaceName}</p>
            <button
              onClick={() => setEditingName(true)}
              className="text-sm text-accent hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg tracking-tight text-slate-900">
          Plan
        </h3>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            Business
          </span>
          <span className="text-sm text-slate-500">
            Unlimited mailboxes, team management, audit log, priority sync.
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="font-display text-lg tracking-tight text-red-900">
          Danger zone
        </h3>
        <p className="mt-2 text-sm text-red-700">
          Downgrading your plan will remove all team members and revoke their access immediately.
        </p>
        <a
          href="/settings"
          className="mt-4 inline-block rounded-md border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Manage subscription
        </a>
      </div>
    </div>
  );
}
