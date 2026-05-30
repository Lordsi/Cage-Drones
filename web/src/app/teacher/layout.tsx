import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";
import { TeacherShell } from "@/components/teacher-sidebar";

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
    <TeacherShell
      courses={(courses ?? []).map((c) => ({
        id: c.id as string,
        title: c.title as string,
      }))}
      displayName={profile.display_name}
      role={profile.role}
    >
      {children}
    </TeacherShell>
  );
}
