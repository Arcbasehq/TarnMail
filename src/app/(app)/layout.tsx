import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Authoritative session check (database-backed). Proxy already did the
  // optimistic cookie gate; this is the real guard.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
