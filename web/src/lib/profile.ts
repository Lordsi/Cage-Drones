import type { SupabaseClient } from "@supabase/supabase-js";

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
