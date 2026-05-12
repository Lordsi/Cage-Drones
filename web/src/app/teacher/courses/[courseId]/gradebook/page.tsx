import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = { display_name: string };

function oneProfile(raw: unknown): ProfileRow | null {
  const p = (Array.isArray(raw) ? raw[0] : raw) as ProfileRow | null;
  return p;
}

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course, error: cErr } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();
  if (cErr || !course) notFound();

  const { data: roster } = await supabase
    .from("enrollments")
    .select("user_id, profiles ( display_name )")
    .eq("course_id", courseId)
    .order("user_id");

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title")
    .eq("course_id", courseId)
    .eq("published", true)
    .order("title");

  const { data: assigns } = await supabase
    .from("assignments")
    .select("id, title")
    .eq("course_id", courseId)
    .order("title");

  const examIds = (exams ?? []).map((e) => e.id as string);
  const assignIds = (assigns ?? []).map((a) => a.id as string);
  const userIds = (roster ?? []).map((r) => r.user_id as string);

  const { data: attempts } =
    examIds.length && userIds.length
      ? await supabase
          .from("exam_attempts")
          .select("exam_id, user_id, score_percent, submitted_at")
          .in("exam_id", examIds)
          .in("user_id", userIds)
          .not("submitted_at", "is", null)
      : { data: [] as Record<string, unknown>[] };

  const bestExam = new Map<string, { score: number; t: string }>();
  for (const row of attempts ?? []) {
    const uid = row.user_id as string;
    const eid = row.exam_id as string;
    const k = `${uid}:${eid}`;
    const t = (row.submitted_at as string) ?? "";
    const score = row.score_percent as number;
    const prev = bestExam.get(k);
    if (!prev || t > prev.t) bestExam.set(k, { score, t });
  }

  const { data: subRows } =
    assignIds.length && userIds.length
      ? await supabase
          .from("assignment_submissions")
          .select("user_id, assignment_id, grade, status")
          .in("assignment_id", assignIds)
          .in("user_id", userIds)
      : { data: [] as Record<string, unknown>[] };

  const assignCell = new Map<string, string>();
  for (const s of subRows ?? []) {
    const k = `${s.user_id as string}:${s.assignment_id as string}`;
    const g = s.grade as string | null;
    const st = s.status as string;
    assignCell.set(k, g && g.length > 0 ? g : st);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="text-sm"
          style={{ color: "var(--cyan)" }}
        >
          ← Course
        </Link>
      </div>
      <h1 className="display mb-2 text-2xl font-extrabold">Gradebook</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string} — latest submitted exam score per assessment; assignment shows grade
        or status.
      </p>

      <div className="card overflow-x-auto rounded-2xl p-4">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                className="sticky left-0 z-10 px-3 py-3 font-bold"
                style={{ background: "var(--card)" }}
              >
                Student
              </th>
              {(exams ?? []).map((ex) => (
                <th key={ex.id as string} className="whitespace-nowrap px-2 py-3 font-semibold">
                  <span className="line-clamp-2 max-w-[120px]">{ex.title as string}</span>
                  <span className="mt-1 block text-[0.65rem] font-normal uppercase tracking-wide text-[var(--muted)]">
                    Exam
                  </span>
                </th>
              ))}
              {(assigns ?? []).map((a) => (
                <th key={a.id as string} className="whitespace-nowrap px-2 py-3 font-semibold">
                  <span className="line-clamp-2 max-w-[120px]">{a.title as string}</span>
                  <span className="mt-1 block text-[0.65rem] font-normal uppercase tracking-wide text-[var(--muted)]">
                    HW
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(roster ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={1 + (exams ?? []).length + (assigns ?? []).length}
                  className="px-3 py-8 text-center"
                  style={{ color: "var(--muted2)" }}
                >
                  No students enrolled.
                </td>
              </tr>
            ) : (
              (roster ?? []).map((r) => {
                const uid = r.user_id as string;
                const prof = oneProfile(r.profiles);
                return (
                  <tr key={uid} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td
                      className="sticky left-0 z-10 px-3 py-2 font-medium"
                      style={{ background: "var(--card)" }}
                    >
                      {prof?.display_name ?? "Student"}
                      <div className="font-mono text-[0.65rem]" style={{ color: "var(--muted)" }}>
                        {uid.slice(0, 8)}…
                      </div>
                    </td>
                    {(exams ?? []).map((ex) => {
                      const cell = bestExam.get(`${uid}:${ex.id as string}`);
                      return (
                        <td key={ex.id as string} className="px-2 py-2 text-center">
                          {cell != null ? `${cell.score}%` : "—"}
                        </td>
                      );
                    })}
                    {(assigns ?? []).map((a) => {
                      const v = assignCell.get(`${uid}:${a.id as string}`);
                      return (
                        <td key={a.id as string} className="px-2 py-2 text-center">
                          {v ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
