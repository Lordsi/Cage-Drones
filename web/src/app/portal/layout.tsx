import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { PortalShell } from "@/components/portal-sidebar";

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
    <PortalShell displayName={profile.display_name} role={profile.role}>
      {children}
    </PortalShell>
  );
}
