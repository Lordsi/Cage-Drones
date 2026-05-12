"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startExamFromForm(formData: FormData) {
  const examId = String(formData.get("exam_id") ?? "");
  if (!examId) throw new Error("Missing exam");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rpc_start_exam_attempt", {
    p_exam_id: examId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/portal/exams");
  redirect(`/exam/${data as string}`);
}

export async function saveExamAnswers(attemptId: string, answers: Record<string, number>) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rpc_save_exam_answers", {
    p_attempt_id: attemptId,
    p_answers: answers,
  });
  if (error) throw new Error(error.message);
}

export async function submitExamAttempt(attemptId: string, answers: Record<string, number>) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rpc_submit_exam_attempt", {
    p_attempt_id: attemptId,
    p_answers: answers,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/exam/${attemptId}`);
  revalidatePath("/portal/exams");
  return data as number;
}
