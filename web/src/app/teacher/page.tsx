import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/app/actions/teacher";
import {
  Users,
  CheckSquare,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

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

  const stats = [
    { label: "Active Students", value: totalStudents, icon: Users, color: "var(--accent)", trend: `+${Math.min(totalStudents, 4)}%` },
    { label: "Avg Assessment", value: avgPerformance != null ? `${avgPerformance}%` : "—", icon: CheckSquare, color: "var(--green)", trend: "Optimal" },
    { label: "Pending Grading", value: totalPending, icon: Clock, color: totalPending > 0 ? "var(--red)" : "var(--muted)", trend: totalPending > 0 ? `${totalPending} items` : "" },
    { label: "Cert. Progress", value: `${courseIds.length}`, icon: TrendingUp, color: "var(--blue)", trend: "On Track" },
  ];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Operational overview and student performance analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-3 py-2 text-sm" style={{ borderRadius: "4px" }}>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>
                <s.icon size={18} style={{ color: s.color }} strokeWidth={1.5} />
              </div>
              {s.trend && (
                <span className="text-[0.68rem] font-medium" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>
                  {s.trend}
                </span>
              )}
            </div>
            <div className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {s.label}
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
              {s.value}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: "#f1f5f9" }}>
              <div className="h-full rounded-full" style={{ width: "60%", background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Create course */}
      <div className="mt-8 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          New Course
        </h2>
        <form action={createCourse} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Title</label>
            <input
              name="title"
              required
              placeholder="Course title"
              className="w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--input-border)",
                color: "var(--text)",
                borderRadius: "4px",
              }}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Description</label>
            <input
              name="description"
              placeholder="Description (optional)"
              className="w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--input-border)",
                color: "var(--text)",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm"
            style={{ borderRadius: "4px" }}
          >
            + New Assessment
          </button>
        </form>
      </div>

      {/* Course cards */}
      <div className="mt-6 space-y-3">
        {(courses ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "var(--muted)" }}>
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
                className="group block card p-5 transition-colors hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold group-hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>
                      {c.title as string}
                    </h3>
                    {c.description && (
                      <p className="mt-1 text-sm line-clamp-1" style={{ color: "var(--muted)" }}>
                        {c.description as string}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--muted)" }} className="mt-1 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-3 flex gap-6 text-xs" style={{ color: "var(--muted)" }}>
                  <span>
                    <strong style={{ color: "var(--text)" }}>{enrolled}</strong> students
                  </span>
                  <span>
                    <strong style={{ color: pending > 0 ? "var(--red)" : "var(--text)" }}>{pending}</strong> pending
                  </span>
                  <span>
                    Avg <strong style={{ color: "var(--text)" }}>{avg != null ? `${avg}%` : "—"}</strong>
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
