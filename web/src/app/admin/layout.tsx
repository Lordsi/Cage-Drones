import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { Bell } from "lucide-react";

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
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: "var(--accent)" }}>CAGE</span>
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Admin</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/admin" className="rounded px-3 py-1.5 text-sm font-medium" style={{ color: "var(--muted2)" }}>
              Dashboard
            </Link>
            <Link href="/admin/users" className="rounded px-3 py-1.5 text-sm font-medium" style={{ color: "var(--muted2)" }}>
              Users
            </Link>
            <Link href="/admin/inquiries" className="rounded px-3 py-1.5 text-sm font-medium" style={{ color: "var(--muted2)" }}>
              Inquiries
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-8 w-8 items-center justify-center rounded" style={{ color: "var(--muted)" }}>
            <Bell size={18} strokeWidth={1.5} />
          </button>
          <Link href="/teacher" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Teacher
          </Link>
          <Link href="/portal" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            Student
          </Link>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {profile.display_name?.slice(0, 1).toUpperCase() ?? "A"}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
