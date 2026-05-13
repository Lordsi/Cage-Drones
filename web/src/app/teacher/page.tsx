import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/app/actions/teacher";

export default async function TeacherHomePage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, published")
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id as string);

  const { data: enrollments } = courseIds.length
    ? await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds)
    : { data: [] as { course_id: unknown }[] };

  const { data: submissions } = courseIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("id, status, assignments!inner ( course_id )")
        .in("assignments.course_id", courseIds)
    : { data: [] as Record<string, unknown>[] };

  const { data: attempts } = courseIds.length
    ? await supabase
        .from("exam_attempts")
        .select("score_percent, exams!inner ( course_id )")
        .not("submitted_at", "is", null)
        .in("exams.course_id", courseIds)
    : { data: [] as Record<string, unknown>[] };

  const enrollCountByCourse = new Map<string, number>();
  for (const e of enrollments ?? []) {
    const cid = e.course_id as string;
    enrollCountByCourse.set(cid, (enrollCountByCourse.get(cid) ?? 0) + 1);
  }

  const pendingByCourse = new Map<string, number>();
  for (const s of submissions ?? []) {
    const a = s.assignments as { course_id: string } | null;
    if (a && (s.status as string) === "submitted") {
      pendingByCourse.set(a.course_id, (pendingByCourse.get(a.course_id) ?? 0) + 1);
    }
  }

  const scoresByCourse = new Map<string, number[]>();
  for (const att of attempts ?? []) {
    const ex = att.exams as { course_id: string } | null;
    if (ex) {
      const arr = scoresByCourse.get(ex.course_id) ?? [];
      arr.push(att.score_percent as number);
      scoresByCourse.set(ex.course_id, arr);
    }
  }

  const totalStudents = new Set(
    (enrollments ?? []).map((e) => JSON.stringify(e)),
  ).size;

  let totalPending = 0;
  for (const v of pendingByCourse.values()) totalPending += v;

  let allScores: number[] = [];
  for (const v of scoresByCourse.values()) allScores = allScores.concat(v);
  const avgPerformance =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Teaching Dashboard</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        Overview of all your courses and activity.
      </p>

      {/* Stats row */}
      <div
        className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--border)" }}
      >
        {[
          { label: "Total students", value: totalStudents },
          { label: "Pending grading", value: totalPending },
          {
            label: "Avg. performance",
            value: avgPerformance != null ? `${avgPerformance}%` : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-5 py-4"
            style={{ background: "var(--surface)" }}
          >
            <div
              className="text-[0.65rem] font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              {stat.label}
            </div>
            <div className="mt-1 text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Create course */}
      <div className="mt-10 border-b pb-8" style={{ borderColor: "var(--border)" }}>
        <h2
          className="text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          New course
        </h2>
        <form action={createCourse} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <input
              name="title"
              required
              placeholder="Course title"
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="flex-1">
            <input
              name="description"
              placeholder="Description (optional)"
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary rounded-md px-4 py-2 text-sm font-medium"
          >
            Create
          </button>
        </form>
      </div>

      {/* Course cards */}
      <div className="mt-8 space-y-3">
        {(courses ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "var(--muted2)" }}>
            No courses yet. Create your first one above.
          </p>
        ) : (
          (courses ?? []).map((c) => {
            const cid = c.id as string;
            const enrolled = enrollCountByCourse.get(cid) ?? 0;
            const pending = pendingByCourse.get(cid) ?? 0;
            const scores = scoresByCourse.get(cid);
            const avg =
              scores && scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : null;
            return (
              <Link
                key={cid}
                href={`/teacher/courses/${cid}`}
                className="group block rounded-lg border p-5 transition-colors hover:border-[var(--accent)]"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold group-hover:text-[var(--accent)]">
                      {c.title as string}
                    </h3>
                    {c.description && (
                      <p
                        className="mt-1 text-sm line-clamp-1"
                        style={{ color: "var(--muted2)" }}
                      >
                        {c.description as string}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    Manage →
                  </span>
                </div>
                <div className="mt-3 flex gap-6 text-xs" style={{ color: "var(--muted2)" }}>
                  <span>
                    <strong className="text-[var(--text)]">{enrolled}</strong>{" "}
                    students
                  </span>
                  <span>
                    <strong className="text-[var(--text)]">{pending}</strong>{" "}
                    pending
                  </span>
                  <span>
                    Avg{" "}
                    <strong className="text-[var(--text)]">
                      {avg != null ? `${avg}%` : "—"}
                    </strong>
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
