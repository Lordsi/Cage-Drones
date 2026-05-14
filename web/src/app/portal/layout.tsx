import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStudentStillAllowed } from "@/lib/profile";
import { PortalSidebar } from "@/components/portal-sidebar";

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

  if (!(await isStudentStillAllowed(supabase, user, profile.role))) {
    await supabase.auth.signOut();
    redirect("/login?denied=allowlist");
  }

  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{ background: "var(--deep)" }}
    >
      <PortalSidebar displayName={profile.display_name} role={profile.role} />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
