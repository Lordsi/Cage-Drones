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
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            C
          </div>
          <span className="text-sm font-bold">CAGE Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/teacher" className="text-sm" style={{ color: "var(--accent)" }}>
            Teacher portal
          </Link>
          <Link href="/portal" className="text-sm" style={{ color: "var(--accent)" }}>
            Student portal
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
