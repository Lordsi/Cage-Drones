import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function courseTitle(raw: unknown): string {
  const c = (Array.isArray(raw) ? raw[0] : raw) as { title: string } | null;
  return c?.title ?? "Course";
}

export default async function PortalGradesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses ( id, title )")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id as string);

  const { data: attempts } = courseIds.length
    ? await supabase
        .from("exam_attempts")
        .select(
          "id, exam_id, submitted_at, score_percent, exams ( title, course_id, courses ( title ) )",
        )
        .eq("user_id", user.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
    : { data: [] as Record<string, unknown>[] };

  const { data: assignments } = courseIds.length
    ? await supabase
        .from("assignments")
        .select("id, title, course_id, courses ( title )")
        .in("course_id", courseIds)
        .order("title")
    : { data: [] as Record<string, unknown>[] };

  const assignIds = (assignments ?? []).map((a) => a.id as string);
  const { data: subs } = assignIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("assignment_id, status, grade, feedback, submitted_at")
        .eq("user_id", user.id)
        .in("assignment_id", assignIds)
    : { data: [] as Record<string, unknown>[] };

  const subByAssign = new Map(
    (subs ?? []).map((s) => [
      s.assignment_id as string,
      s as {
        status: string;
        grade: string | null;
        feedback: string | null;
        submitted_at: string | null;
      },
    ]),
  );

  type AttemptRow = {
    id: string;
    exam_id: string;
    submitted_at: string;
    score_percent: number | null;
    exams: {
      title: string;
      course_id: string;
      courses: { title: string } | null;
    } | null;
  };

  const examRows = (attempts ?? []) as AttemptRow[];

  return (
    <div>
      <div className="mb-8">
        <div
          className="font-display mb-1 text-[0.7rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Record
        </div>
        <h1 className="display text-3xl font-extrabold">Grades & results</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
          Submitted exams and graded coursework from your enrolled courses.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="display mb-4 text-lg font-bold">Exams</h2>
        {examRows.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No submitted exam attempts yet. Finish an exam from{" "}
            <Link href="/portal/exams" className="underline" style={{ color: "var(--cyan)" }}>
              My exams
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {examRows.map((row) => {
              const ex = row.exams;
              const courseLabel = ex?.courses?.title ?? courseTitle(ex?.courses);
              return (
                <li
                  key={row.id}
                  className="card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5"
                >
                  <div>
                    <div className="font-semibold">{ex?.title ?? "Exam"}</div>
                    <div className="text-sm" style={{ color: "var(--muted2)" }}>
                      {courseLabel}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      Submitted {new Date(row.submitted_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.score_percent != null ? (
                      <span className="badge badge-green">{row.score_percent}%</span>
                    ) : (
                      <span className="badge badge-orange">Pending score</span>
                    )}
                    <Link href={`/exam/${row.id}`} className="btn-ghost rounded-lg px-4 py-2 text-sm">
                      Review
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="display mb-4 text-lg font-bold">Assignments</h2>
        {(assignments ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No assignments in your courses.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(assignments ?? []).map((raw) => {
              const a = raw as {
                id: string;
                title: string;
                courses: { title: string } | null;
              };
              const sub = subByAssign.get(a.id);
              const graded = sub?.status === "graded";
              return (
                <li
                  key={a.id}
                  className="card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5"
                >
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-sm" style={{ color: "var(--muted2)" }}>
                      {courseTitle(a.courses)}
                    </div>
                    {sub?.submitted_at ? (
                      <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                        Submitted {new Date(sub.submitted_at).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right text-sm">
                    {graded && sub?.grade ? (
                      <span className="badge badge-green">{sub.grade}</span>
                    ) : sub?.status === "submitted" ? (
                      <span className="badge badge-cyan">Submitted</span>
                    ) : (
                      <span className="badge badge-orange">Not submitted</span>
                    )}
                    {graded && sub?.feedback ? (
                      <p className="mt-2 max-w-md text-xs" style={{ color: "var(--muted2)" }}>
                        {sub.feedback}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
