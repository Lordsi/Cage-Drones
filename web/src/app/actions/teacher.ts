"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";

async function requireStaff() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || !isStaff(profile.role)) {
    throw new Error("Forbidden");
  }
  return { supabase, profile };
}

export async function createCourse(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) throw new Error("Title required");
  const { error } = await supabase.from("courses").insert({
    title,
    description,
    created_by: profile.id,
    published: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher");
}

export async function createExam(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const duration = Number(formData.get("duration_minutes") ?? 30);
  const passPercent = Number(formData.get("pass_percent") ?? 70);
  if (!courseId || !title) throw new Error("Missing fields");
  const { data, error } = await supabase
    .from("exams")
    .insert({
      course_id: courseId,
      title,
      duration_minutes: duration,
      pass_percent: passPercent,
      published: false,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  redirect(`/teacher/courses/${courseId}/exams/${data.id as string}`);
}

export async function addExamQuestion(formData: FormData) {
  const { supabase } = await requireStaff();
  const examId = String(formData.get("exam_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const choicesRaw = String(formData.get("choices") ?? "").trim();
  const correctIndex = Number(formData.get("correct_index") ?? 0);
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const choices = choicesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!examId || !prompt || choices.length < 2) throw new Error("Invalid question");
  const { error } = await supabase.from("exam_questions").insert({
    exam_id: examId,
    sort_order: sortOrder,
    prompt,
    choices,
    correct_index: correctIndex,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}/exams/${examId}`);
}

export async function setExamPublished(examId: string, courseId: string, published: boolean) {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from("exams").update({ published }).eq("id", examId);
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}/exams/${examId}`);
  revalidatePath("/portal/exams");
}

export async function setExamPublishedForm(formData: FormData) {
  const examId = String(formData.get("exam_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  await setExamPublished(examId, courseId, published);
}

export async function enrollStudent(formData: FormData) {
  const { supabase } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!courseId || !userId) throw new Error("Course and student user ID required");
  const { error } = await supabase.from("enrollments").insert({
    course_id: courseId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/students`);
}

export async function enrollStudentByEmail(formData: FormData) {
  const { supabase } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!courseId || !email) throw new Error("Course and email required");

  const { data: userId, error: lookupErr } = await supabase.rpc("lookup_user_by_email", {
    p_email: email,
  });
  if (lookupErr) throw new Error(lookupErr.message);
  if (!userId) throw new Error(`No user found with email: ${email}`);

  const { error } = await supabase.from("enrollments").insert({
    course_id: courseId,
    user_id: userId,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Student is already enrolled");
    throw new Error(error.message);
  }
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/students`);
}

export async function unenrollStudent(formData: FormData) {
  const { supabase } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  if (!courseId || !userId) throw new Error("Missing fields");
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/students`);
}

export async function createAssignment(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const due = String(formData.get("due_at") ?? "").trim();
  if (!courseId || !title) throw new Error("Missing fields");
  const { error } = await supabase.from("assignments").insert({
    course_id: courseId,
    title,
    instructions,
    due_at: due ? new Date(due).toISOString() : null,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/assignments`);
  revalidatePath("/portal/assignments");
}

export async function createResource(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const resourceType = String(formData.get("resource_type") ?? "pdf") as "pdf" | "video" | "link";
  const externalUrl = String(formData.get("external_url") ?? "").trim();
  const storagePath = String(formData.get("storage_path") ?? "").trim();
  const meta = String(formData.get("meta") ?? "").trim();
  if (!courseId || !title) throw new Error("Missing fields");
  const { error } = await supabase.from("resources").insert({
    course_id: courseId,
    title,
    resource_type: resourceType,
    external_url: externalUrl || null,
    storage_path: storagePath || null,
    meta,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/resources`);
  revalidatePath("/portal/resources");
}

export async function deleteResource(formData: FormData) {
  const { supabase } = await requireStaff();
  const resourceId = String(formData.get("resource_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  if (!resourceId) throw new Error("Missing resource ID");
  const { error } = await supabase.from("resources").delete().eq("id", resourceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/resources`);
  revalidatePath("/portal/resources");
}

export async function createAnnouncement(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const pinned =
    String(formData.get("pinned") ?? "") === "on" ||
    String(formData.get("pinned") ?? "") === "true";
  if (!courseId || !title) throw new Error("Title required");
  const { error } = await supabase.from("announcements").insert({
    course_id: courseId,
    title,
    body,
    pinned,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath("/portal");
}
