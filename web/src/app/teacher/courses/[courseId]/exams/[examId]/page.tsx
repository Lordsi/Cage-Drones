import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addExamQuestion, setExamPublishedForm } from "@/app/actions/teacher";

export default async function TeacherExamEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; examId: string }>;
}) {
  const { courseId, examId } = await params;
  const supabase = await createClient();
  const { data: exam, error } = await supabase
    .from("exams")
    .select("id, title, published, duration_minutes, pass_percent")
    .eq("id", examId)
    .eq("course_id", courseId)
    .single();
  if (error || !exam) notFound();

  const { data: questions } = await supabase
    .from("exam_questions")
    .select("id, sort_order, prompt, choices, correct_index")
    .eq("exam_id", examId)
    .order("sort_order", { ascending: true });

  const nextOrder =
    (questions ?? []).length > 0
      ? Math.max(...(questions ?? []).map((q) => q.sort_order as number)) + 1
      : 0;

  return (
    <div>
      <Link
        href={`/teacher/courses/${courseId}/exams`}
        className="mb-6 inline-block text-sm"
        style={{ color: "var(--accent)" }}
      >
        ← All exams
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{exam.title as string}</h1>
        <div className="flex gap-2">
          {(exam.published as boolean) ? (
            <form action={setExamPublishedForm}>
              <input type="hidden" name="exam_id" value={examId} />
              <input type="hidden" name="course_id" value={courseId} />
              <input type="hidden" name="published" value="false" />
              <button type="submit" className="btn-ghost rounded-lg px-4 py-2 text-sm">
                Unpublish
              </button>
            </form>
          ) : (
            <form action={setExamPublishedForm}>
              <input type="hidden" name="exam_id" value={examId} />
              <input type="hidden" name="course_id" value={courseId} />
              <input type="hidden" name="published" value="true" />
              <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
                Publish
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="mb-8 text-sm" style={{ color: "var(--muted2)" }}>
        Duration {exam.duration_minutes as number} min · Pass {exam.pass_percent as number}%
      </p>

      <section className="card mb-8 rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Questions</h2>
        <ol className="mb-6 list-decimal space-y-3 pl-5 text-sm" style={{ color: "var(--muted2)" }}>
          {(questions ?? []).map((q) => (
            <li key={q.id as string} className="pl-1">
              <span className="font-medium text-[var(--text)]">{q.prompt as string}</span>
              <span className="ml-2 text-xs">
                (correct index {(q.correct_index as number) ?? 0})
              </span>
            </li>
          ))}
        </ol>

        <h3 className="mb-3 text-sm font-semibold">Add MCQ</h3>
        <form action={addExamQuestion} className="flex flex-col gap-2">
          <input type="hidden" name="exam_id" value={examId} />
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="sort_order" value={String(nextOrder)} />
          <textarea
            name="prompt"
            required
            placeholder="Question text"
            rows={2}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="choices"
            required
            placeholder={'One choice per line, e.g.\nOption A\nOption B\nOption C'}
            rows={4}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="correct_index"
            type="number"
            min={0}
            defaultValue={0}
            className="w-32 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Correct index is 0-based (0 = first line).
          </p>
          <button type="submit" className="btn-primary w-fit rounded-lg px-4 py-2 text-sm">
            Add question
          </button>
        </form>
      </section>
    </div>
  );
}
