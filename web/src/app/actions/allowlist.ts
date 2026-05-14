"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";

async function requireAdmin() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }
  return { supabase, profile };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

export async function addAllowlistEntry(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) throw new Error("Enter a valid email address.");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  const { error } = await supabase
    .from("student_allowlist")
    .upsert({ email, note, added_by: profile.id }, { onConflict: "email" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/allowlist");
}

export async function bulkAddAllowlistEntries(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const raw = String(formData.get("emails") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  const parts = raw
    .split(/[\s,;]+/)
    .map((s) => normalizeEmail(s))
    .filter((s): s is string => Boolean(s));
  const unique = Array.from(new Set(parts));
  if (unique.length === 0) throw new Error("No valid emails found.");
  const rows = unique.map((email) => ({ email, note, added_by: profile.id }));
  const { error } = await supabase
    .from("student_allowlist")
    .upsert(rows, { onConflict: "email" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/allowlist");
}

export async function removeAllowlistEntry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) throw new Error("Invalid email.");
  const { error } = await supabase
    .from("student_allowlist")
    .delete()
    .eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/allowlist");
}
