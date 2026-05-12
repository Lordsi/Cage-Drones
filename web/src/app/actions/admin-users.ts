"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, type UserRole } from "@/lib/profile";

async function requireAdmin() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }
  return { supabase };
}

const ROLES: UserRole[] = ["student", "instructor", "admin"];

export async function updateUserRole(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as UserRole;
  if (!userId || !ROLES.includes(role)) throw new Error("Invalid user or role");
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/teacher");
}
