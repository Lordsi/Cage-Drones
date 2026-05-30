import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { Bell, Home } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
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
  if (!profile || profile.role !== "admin") {
    redirect(profile?.role === "instructor" ? "/teacher" : "/portal");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="font-display text-lg font-bold tracking-tight"
              style={{ color: "var(--accent)" }}
            >
              CAGE
            </span>
            <span className="t-label hidden sm:inline">Admin</span>
          </Link>
          <div className="hidden h-6 w-px sm:block" style={{ background: "var(--border)" }} />
          <AdminNav />
          <div className="flex items-center gap-1">
            <Link href="/" className="icon-btn" title="Home">
              <Home size={17} strokeWidth={1.75} />
            </Link>
            <span className="icon-btn" style={{ opacity: 0.45 }} title="Notifications">
              <Bell size={17} strokeWidth={1.75} />
            </span>
            <div
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {profile.display_name?.slice(0, 1).toUpperCase() ?? "A"}
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
