import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isSiteAdmin } from "@/lib/auth/admin";

// Global site-admin shell. Gated by ADMIN_EMAILS (see lib/auth/admin).
//  - Not signed in        → send to login (so the owner can authenticate).
//  - Signed in, not admin → 404, so the panel's existence isn't revealed.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?callbackUrl=/admin/users");
  if (!isSiteAdmin(session.user.email)) notFound();
  const admin = { email: session.user.email };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-display text-xl tracking-tight text-slate-900">
              tarnmail
            </span>
            <nav className="flex items-center gap-1">
              <a
                href="/admin/users"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Users
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{admin.email}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Site Admin
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
