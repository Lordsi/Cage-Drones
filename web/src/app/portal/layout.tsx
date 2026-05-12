import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
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

  return (
    <div className="flex min-h-screen" style={{ background: "var(--deep)" }}>
      <PortalSidebar displayName={profile.display_name} role={profile.role} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
