import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";
import { TeacherSidebar } from "@/components/teacher-sidebar";

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
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{ background: "var(--deep)" }}
    >
      <TeacherSidebar
        courses={(courses ?? []).map((c) => ({
          id: c.id as string,
          title: c.title as string,
        }))}
        displayName={profile.display_name}
        role={profile.role}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
