import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";
import { Radar } from "lucide-react";

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

  const isAdmin = profile.role === "admin";

  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/teacher" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--cyan)" }}
          >
            <Radar size={16} color="#000" />
          </div>
          <span className="display text-sm font-extrabold">CAGE Teacher</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <Link href="/admin" className="text-sm underline" style={{ color: "var(--cyan)" }}>
              Admin
            </Link>
          ) : null}
          <Link href="/portal" className="text-sm underline" style={{ color: "var(--cyan)" }}>
            Student portal
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
