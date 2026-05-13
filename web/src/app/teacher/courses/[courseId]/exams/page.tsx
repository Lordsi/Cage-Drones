import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExam } from "@/app/actions/teacher";
import { FileText, Plus, Clock, Target, Eye, EyeOff } from "lucide-react";

export default async function TeacherExamsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();
  if (courseErr || !course) notFound();

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, published, duration_minutes, pass_percent, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  const examIds = (exams ?? []).map((e) => e.id as string);

  const questionCounts: Record<string, number> = {};
  if (examIds.length > 0) {
    const { data: qRows } = await supabase
      .from("exam_questions")
      .select("exam_id")
      .in("exam_id", examIds);
    (qRows ?? []).forEach((q) => {
      const eid = q.exam_id as string;
      questionCounts[eid] = (questionCounts[eid] ?? 0) + 1;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string}
      </p>

      {/* Create exam form */}
      <form action={createExam} className="card mt-8 rounded-xl p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          Create new exam
        </h2>
        <input type="hidden" name="course_id" value={courseId} />
        <div className="flex flex-wrap gap-3">
          <input
            name="title"
            required
            placeholder="Exam title"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
              minWidth: "200px",
            }}
          />
          <input
            name="duration_minutes"
            type="number"
            min={1}
            defaultValue={30}
            className="w-24 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            placeholder="Min"
          />
          <input
            name="pass_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={70}
            className="w-24 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            placeholder="Pass %"
          />
          <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
            <Plus size={14} />
            Create
          </button>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          Duration in minutes. Pass threshold as a percentage. You can add questions after creating.
        </p>
      </form>

      {/* Exam list */}
      <div className="mt-8 space-y-3">
        {(exams ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--muted2)" }}>
            No exams yet. Create one above to get started.
          </p>
        ) : (
          (exams ?? []).map((exam) => {
            const published = exam.published as boolean;
            const qCount = questionCounts[exam.id as string] ?? 0;
            return (
              <Link
                key={exam.id as string}
                href={`/teacher/courses/${courseId}/exams/${exam.id}`}
                className="card group flex items-center gap-4 rounded-xl px-5 py-4 transition"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: published
                      ? "color-mix(in srgb, var(--green) 12%, transparent)"
                      : "color-mix(in srgb, var(--text) 6%, transparent)",
                  }}
                >
                  <FileText
                    size={18}
                    style={{ color: published ? "var(--green)" : "var(--muted)" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                      {exam.title as string}
                    </span>
                    <span
                      className={`badge ${published ? "badge-green" : "badge-gray"}`}
                    >
                      {published ? (
                        <><Eye size={10} /> Published</>
                      ) : (
                        <><EyeOff size={10} /> Draft</>
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs" style={{ color: "var(--muted2)" }}>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {exam.duration_minutes as number} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={11} />
                      Pass {exam.pass_percent as number}%
                    </span>
                    <span>{qCount} question{qCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
