"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";

function makeSerial(courseId: string, userId: string): string {
  const year = new Date().getFullYear();
  const c = courseId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const u = userId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CAGE-${year}-${c}-${u}-${rnd}`;
}

export async function issueCertificate(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || !isStaff(profile.role)) throw new Error("Forbidden");

  const courseId = String(formData.get("course_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const grade = String(formData.get("grade") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim();
  if (!courseId || !userId) throw new Error("Missing fields");

  const serial = makeSerial(courseId, userId);

  const { error } = await supabase.from("certificates").insert({
    user_id: userId,
    course_id: courseId,
    serial,
    issued_by: profile.id,
    grade,
    notes,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Certificate already exists for this student in this course");
    throw new Error(error.message);
  }
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/gradebook`);
  revalidatePath("/portal/certificates");
}

export async function revokeCertificate(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || !isStaff(profile.role)) throw new Error("Forbidden");

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) throw new Error("Missing id");
  const { error } = await supabase
    .from("certificates")
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
      revoke_reason: reason || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/certificates");
}
