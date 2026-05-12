import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExamRunner, type ExamQuestionRow } from "@/components/exam-runner";
import { ExamReview, type ReviewRow } from "@/components/exam-review";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: attempt, error } = await supabase
    .from("exam_attempts")
    .select("id, exam_id, user_id, ends_at, submitted_at, score_percent, answers")
    .eq("id", attemptId)
    .single();

  if (error || !attempt || attempt.user_id !== user.id) notFound();

  const { data: exam } = await supabase
    .from("exams")
    .select("title")
    .eq("id", attempt.exam_id as string)
    .single();

  const title = (exam?.title as string) ?? "Exam";

  if (attempt.submitted_at) {
    const { data: review, error: revErr } = await supabase.rpc("rpc_student_exam_review", {
      p_attempt_id: attemptId,
    });
    if (revErr) {
      return (
        <p className="p-8 text-sm" style={{ color: "var(--orange)" }}>
          {revErr.message}
        </p>
      );
    }
    const rows = (review ?? []) as ReviewRow[];
    return (
      <ExamReview
        examTitle={title}
        score={(attempt.score_percent as number) ?? 0}
        rows={rows}
      />
    );
  }

  const { data: questions, error: qErr } = await supabase.rpc("rpc_student_exam_questions", {
    p_exam_id: attempt.exam_id as string,
  });

  if (qErr) {
    return (
      <p className="p-8 text-sm" style={{ color: "var(--orange)" }}>
        {qErr.message}
      </p>
    );
  }

  const normalized: ExamQuestionRow[] = (questions ?? []).map(
    (row: { id: string; sort_order: number; prompt: string; choices: unknown }) => ({
      id: row.id,
      sort_order: row.sort_order,
      prompt: row.prompt,
      choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
    }),
  );

  const initialAnswers = (attempt.answers as Record<string, number>) ?? {};

  return (
    <ExamRunner
      attemptId={attemptId}
      examTitle={title}
      endsAtIso={attempt.ends_at as string}
      questions={normalized}
      initialAnswers={initialAnswers}
    />
  );
}
