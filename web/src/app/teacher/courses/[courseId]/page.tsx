import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExam, createAnnouncement } from "@/app/actions/teacher";

export default async function TeacherCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();
  if (error || !course) notFound();

  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, published")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  const publishedExamCount = (exams ?? []).filter(
    (e) => e.published as boolean,
  ).length;

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id")
    .eq("course_id", courseId);
  const assignmentIds = (assignments ?? []).map((a) => a.id as string);

  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("status")
        .in("assignment_id", assignmentIds)
    : { data: [] as { status: unknown }[] };

  const pendingCount = (submissions ?? []).filter(
    (s) => (s.status as string) === "submitted",
  ).length;

  const examIds = (exams ?? []).map((e) => e.id as string);
  const { data: attempts } = examIds.length
    ? await supabase
        .from("exam_attempts")
        .select("score_percent")
        .in("exam_id", examIds)
        .not("submitted_at", "is", null)
    : { data: [] as { score_percent: unknown }[] };
  const scores = (attempts ?? []).map((a) => a.score_percent as number);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, pinned, created_at")
    .eq("course_id", courseId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  const quickLinks = [
    { href: `/teacher/courses/${courseId}/students`, label: "Students" },
    { href: `/teacher/courses/${courseId}/assignments`, label: "Assignments" },
    { href: `/teacher/courses/${courseId}/gradebook`, label: "Gradebook" },
    { href: `/teacher/courses/${courseId}/resources`, label: "Resources" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{course.title as string}</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        Course overview and quick actions
      </p>

      {/* Stats */}
      <div
        className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:grid-cols-4"
        style={{ borderColor: "var(--border)" }}
      >
        {[
          { label: "Students", value: enrolledCount ?? 0 },
          { label: "Avg. score", value: avgScore != null ? `${avgScore}%` : "—" },
          { label: "Pending submissions", value: pendingCount },
          { label: "Published exams", value: publishedExamCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-4 py-3"
            style={{ background: "var(--surface)" }}
          >
            <div
              className="text-[0.6rem] font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              {stat.label}
            </div>
            <div className="mt-1 text-lg font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-2">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Exams */}
      <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--border)" }}>
        <h2
          className="text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Exams
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(exams ?? []).map((ex) => (
            <li key={ex.id as string} className="flex items-center gap-3">
              <Link
                href={`/teacher/courses/${courseId}/exams/${ex.id as string}`}
                className="font-medium hover:text-[var(--accent)]"
              >
                {ex.title as string}
              </Link>
              <span
                className={`badge ${(ex.published as boolean) ? "badge-green" : "badge-orange"}`}
              >
                {(ex.published as boolean) ? "Published" : "Draft"}
              </span>
            </li>
          ))}
        </ul>
        <form action={createExam} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="New exam title"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="duration_minutes"
            type="number"
            min={1}
            defaultValue={30}
            className="w-20 rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            title="Duration (min)"
          />
          <input
            name="pass_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={70}
            className="w-20 rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            title="Pass %"
          />
          <button
            type="submit"
            className="btn-primary rounded-md px-4 py-2 text-sm font-medium"
          >
            Create exam
          </button>
        </form>
      </section>

      {/* Announcements */}
      <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--border)" }}>
        <h2
          className="text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Announcements
        </h2>
        <ul className="mt-3 max-h-60 space-y-3 overflow-y-auto text-sm">
          {(announcements ?? []).map((n) => (
            <li
              key={n.id as string}
              className="border-b pb-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                {(n.pinned as boolean) && (
                  <span className="badge badge-orange">Pinned</span>
                )}
                <span className="font-medium">{n.title as string}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(n.created_at as string).toLocaleDateString()}
                </span>
              </div>
              {n.body && (
                <p
                  className="mt-1 whitespace-pre-wrap text-xs"
                  style={{ color: "var(--muted2)" }}
                >
                  {n.body as string}
                </p>
              )}
            </li>
          ))}
        </ul>
        <form
          action={createAnnouncement}
          className="mt-4 flex flex-col gap-2"
        >
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="Headline"
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="body"
            placeholder="Message body (optional)"
            rows={2}
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <div className="flex items-center gap-4">
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--muted2)" }}
            >
              <input type="checkbox" name="pinned" />
              Pin to top
            </label>
            <button
              type="submit"
              className="btn-primary rounded-md px-4 py-2 text-sm font-medium"
            >
              Post
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
