import { notFound, redirect } from "next/navigation";
import { getSiteAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { PLAN_LABEL } from "@/lib/plans";
import type { Plan } from "@prisma/client";

// Re-checked inside every action: the layout gate alone doesn't protect Server
// Actions (they're independent POST endpoints).
async function requireAdmin() {
  const admin = await getSiteAdmin();
  if (!admin) notFound();
  return admin;
}

async function upgradeUser(formData: FormData) {
  "use server";
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as Plan;
  if (!userId || !["FREE", "DEEP", "FATHOM", "BUSINESS"].includes(plan)) return;

  await prisma.user.update({ where: { id: userId }, data: { plan } });
  redirect("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  const admin = await requireAdmin();

  const userId = formData.get("userId") as string;
  if (!userId) return;
  // Guard against an admin deleting their own account out from under the panel.
  if (userId === admin.id) return;

  await prisma.user.delete({ where: { id: userId } });
  redirect("/admin/users");
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  const planCounts = users.reduce(
    (acc, u) => {
      acc[u.plan] = (acc[u.plan] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-red-600">
            Site Admin
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} total users · Signed in as {admin.email}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-display tracking-tight text-slate-900">{users.length}</p>
          <p className="text-sm text-slate-500">Total users</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-display tracking-tight text-slate-900">{planCounts.FREE ?? 0}</p>
          <p className="text-sm text-slate-500">Free (Tarn)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-display tracking-tight text-slate-900">{(planCounts.DEEP ?? 0) + (planCounts.FATHOM ?? 0)}</p>
          <p className="text-sm text-slate-500">Paid users</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-display tracking-tight text-accent">{planCounts.BUSINESS ?? 0}</p>
          <p className="text-sm text-slate-500">Business</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Providers</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-900">{u.email ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600">{u.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.plan === "BUSINESS"
                        ? "bg-accent/10 text-accent"
                        : u.plan === "FATHOM"
                        ? "bg-purple-100 text-purple-700"
                        : u.plan === "DEEP"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {PLAN_LABEL[u.plan]}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {u.accounts.map((a) => a.provider).join(", ") || "—"}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <form action={upgradeUser} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="plan"
                        defaultValue={u.plan}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="FREE">Tarn</option>
                        <option value="DEEP">Deep</option>
                        <option value="FATHOM">Fathom</option>
                        <option value="BUSINESS">Business</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-dark"
                      >
                        Update
                      </button>
                    </form>
                    {u.id !== admin.id && (
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
