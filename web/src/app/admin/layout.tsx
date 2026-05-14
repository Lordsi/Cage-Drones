import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";

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
        className="sticky top-0 z-50 flex h-14 items-center justify-between gap-3 border-b px-4 sm:px-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            C
          </div>
          <span className="truncate text-sm font-bold">CAGE Admin</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/teacher"
            className="text-xs sm:text-sm"
            style={{ color: "var(--accent)" }}
          >
            <span className="hidden sm:inline">Teacher portal</span>
            <span className="sm:hidden">Teacher</span>
          </Link>
          <Link
            href="/portal"
            className="text-xs sm:text-sm"
            style={{ color: "var(--accent)" }}
          >
            <span className="hidden sm:inline">Student portal</span>
            <span className="sm:hidden">Student</span>
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
        {children}
      </div>
    </div>
  );
}
