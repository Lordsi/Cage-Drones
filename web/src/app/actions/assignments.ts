"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function ensureSubmissionRow(assignmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("assignment_submissions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("assignment_submissions")
    .insert({
      assignment_id: assignmentId,
      user_id: user.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function finalizeSubmission(assignmentId: string, filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      file_path: filePath,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/portal/assignments");
}

export async function gradeSubmission(formData: FormData) {
  const supabase = await createClient();
  const submissionId = String(formData.get("submission_id") ?? "");
  const grade = String(formData.get("grade") ?? "").trim();
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (!submissionId) throw new Error("Missing submission");
  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      grade: grade || null,
      feedback: feedback || null,
      status: "graded",
    })
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/assignments");
  revalidatePath(`/teacher/courses/${String(formData.get("course_id") ?? "")}`);
}
