import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import Link from "next/link";
import { Bell } from "lucide-react";

export default async function TeacherLayout({
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
  if (!profile || !isStaff(profile.role)) redirect("/portal");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen" style={{ background: "var(--deep)" }}>
      <TeacherSidebar
        courses={(courses ?? []).map((c) => ({
          id: c.id as string,
          title: c.title as string,
        }))}
        displayName={profile.display_name}
        role={profile.role}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <header
          className="sticky top-0 z-40 flex h-12 items-center justify-between border-b px-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Dashboard</span>
            <span className="text-sm" style={{ color: "var(--muted)" }}>·</span>
            <Link href="/admin" className="text-sm font-medium" style={{ color: "var(--muted2)" }}>Admin</Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-8 w-8 items-center justify-center rounded" style={{ color: "var(--muted)" }}>
              <Bell size={17} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{profile.display_name}</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {profile.display_name?.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
