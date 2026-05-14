import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStudentStillAllowed } from "@/lib/profile";

export default async function ExamShellLayout({
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
  if (
    profile?.role === "student" &&
    !(await isStudentStillAllowed(supabase, user, profile.role))
  ) {
    await supabase.auth.signOut();
    redirect("/login?denied=allowlist");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      {children}
    </div>
  );
}
