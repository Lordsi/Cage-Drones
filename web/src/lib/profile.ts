import type { SupabaseClient, User } from "@supabase/supabase-js";

export type UserRole = "student" | "instructor" | "admin";

export type Profile = {
  id: string;
  display_name: string;
  role: UserRole;
};

export async function getProfile(
  supabase: SupabaseClient,
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

export function isStaff(role: UserRole) {
  return role === "instructor" || role === "admin";
}

/**
 * For students only: confirms the user is still on the allow-list. Staff
 * (instructor/admin) bypass and always return true. Returns false if the
 * user has no email on file or the lookup fails.
 */
export async function isStudentStillAllowed(
  supabase: SupabaseClient,
  user: User,
  role: UserRole,
): Promise<boolean> {
  if (role !== "student") return true;
  const email = user.email?.trim().toLowerCase() ?? "";
  if (!email) return false;
  const { data, error } = await supabase.rpc("email_is_allowlisted", {
    p_email: email,
  });
  if (error) return false;
  return data === true;
}

/** Default landing path after sign-in by app role */
export function homePathForRole(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/teacher";
  return "/portal";
}

export function roleDisplayLabel(role: UserRole): string {
  if (role === "instructor") return "Teacher";
  if (role === "admin") return "Admin";
  return "Student";
}
