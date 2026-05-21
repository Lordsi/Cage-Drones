import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { PortalSidebar } from "@/components/portal-sidebar";
import Link from "next/link";
import { Bell, Home } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase);
  if (!profile) redirect("/login");

  if (profile.role === "instructor") {
    redirect("/teacher");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--deep)" }}>
      <PortalSidebar displayName={profile.display_name} role={profile.role} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <header
          className="sticky top-0 z-40 flex h-12 items-center justify-end border-b px-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded" style={{ color: "var(--muted)" }} title="Back to Home">
              <Home size={17} strokeWidth={1.5} />
            </Link>
            <button className="flex h-8 w-8 items-center justify-center rounded" style={{ color: "var(--muted)" }}>
              <Bell size={17} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium sm:block" style={{ color: "var(--text)" }}>{profile.display_name}</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {profile.display_name?.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
