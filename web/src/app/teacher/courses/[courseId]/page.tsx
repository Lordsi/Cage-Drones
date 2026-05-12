import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createAssignment,
  createResource,
  createExam,
  enrollStudent,
  createAnnouncement,
} from "@/app/actions/teacher";
import { gradeSubmission } from "@/app/actions/assignments";

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

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, published, duration_minutes")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, profiles ( display_name )")
    .eq("course_id", courseId);

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_at")
    .eq("course_id", courseId)
    .order("due_at", { ascending: true });

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, resource_type, storage_path, external_url")
    .eq("course_id", courseId);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, pinned, created_at")
    .eq("course_id", courseId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(25);

  const assignmentIds = (assignments ?? []).map((a) => a.id as string);
  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("id, assignment_id, user_id, status, grade, file_path")
        .in("assignment_id", assignmentIds)
    : { data: [] as Record<string, unknown>[] };

  const titleByAssignment = new Map(
    (assignments ?? []).map((a) => [a.id as string, a.title as string]),
  );

  return (
    <div>
      <Link href="/teacher" className="mb-6 inline-block text-sm" style={{ color: "var(--cyan)" }}>
        ← All courses
      </Link>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-2xl font-extrabold">{course.title}</h1>
        <Link
          href={`/teacher/courses/${courseId}/gradebook`}
          className="btn-outline rounded-lg px-4 py-2 text-sm"
        >
          Gradebook
        </Link>
      </div>

      <section className="card mb-8 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Announcements</h2>
        <p className="mb-4 text-xs" style={{ color: "var(--muted2)" }}>
          Shown on the student portal dashboard (like a school bulletin).
        </p>
        <ul className="mb-6 max-h-48 space-y-2 overflow-y-auto text-sm" style={{ color: "var(--muted2)" }}>
          {(announcements ?? []).map((n) => (
            <li key={n.id as string} className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
              {(n.pinned as boolean) ? <span className="badge badge-orange mr-2">Pinned</span> : null}
              <span className="font-medium text-[var(--text)]">{n.title as string}</span>
              <span className="ml-2 text-xs">
                {new Date(n.created_at as string).toLocaleString()}
              </span>
              {n.body ? (
                <div className="mt-1 whitespace-pre-wrap text-xs">{n.body as string}</div>
              ) : null}
            </li>
          ))}
        </ul>
        <form action={createAnnouncement} className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="Headline"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="body"
            placeholder="Message to students"
            rows={3}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--muted2)" }}>
            <input type="checkbox" name="pinned" />
            Pin to top
          </label>
          <button type="submit" className="btn-primary w-fit rounded-lg px-4 py-2 text-sm">
            Post announcement
          </button>
        </form>
      </section>

      <section className="card mb-8 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Enroll student</h2>
        <p className="mb-3 text-xs" style={{ color: "var(--muted2)" }}>
          Paste the student&apos;s Supabase Auth user UUID (from Authentication → Users in the
          Supabase dashboard).
        </p>
        <form action={enrollStudent} className="flex flex-wrap gap-2">
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="user_id"
            required
            placeholder="Student UUID"
            className="min-w-[280px] flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
            Enroll
          </button>
        </form>
        <ul className="mt-4 space-y-1 text-sm" style={{ color: "var(--muted2)" }}>
          {(enrollments ?? []).map((e) => {
            const raw = e.profiles as unknown;
            const p = (Array.isArray(raw) ? raw[0] : raw) as {
              display_name: string;
            } | null;
            return (
              <li key={e.user_id as string}>
                {p?.display_name ?? "Student"} · <code className="text-xs">{e.user_id as string}</code>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card mb-8 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Exams</h2>
        <ul className="mb-4 space-y-2">
          {(exams ?? []).map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/teacher/courses/${courseId}/exams/${ex.id}`}
                className="text-sm underline"
                style={{ color: "var(--cyan)" }}
              >
                {ex.title as string}
              </Link>
              <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
                {(ex.published as boolean) ? "published" : "draft"} · {ex.duration_minutes as number} min
              </span>
            </li>
          ))}
        </ul>
        <form action={createExam} className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="New exam title"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <div className="flex gap-2">
            <input
              name="duration_minutes"
              type="number"
              min={1}
              defaultValue={30}
              className="w-28 rounded-lg border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            <input
              name="pass_percent"
              type="number"
              min={0}
              max={100}
              defaultValue={70}
              className="w-28 rounded-lg border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <button type="submit" className="btn-primary w-fit rounded-lg px-4 py-2 text-sm">
            Create exam & edit questions
          </button>
        </form>
      </section>

      <section className="card mb-8 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Assignments</h2>
        <ul className="mb-4 text-sm" style={{ color: "var(--muted2)" }}>
          {(assignments ?? []).map((a) => (
            <li key={a.id}>
              {a.title as string}
              {a.due_at ? ` · due ${new Date(a.due_at as string).toLocaleString()}` : ""}
            </li>
          ))}
        </ul>
        <form action={createAssignment} className="flex flex-col gap-2">
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="Assignment title"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="instructions"
            placeholder="Instructions"
            rows={2}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="due_at"
            type="datetime-local"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button type="submit" className="btn-primary w-fit rounded-lg px-4 py-2 text-sm">
            Add assignment
          </button>
        </form>
      </section>

      <section className="card mb-8 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Resources</h2>
        <ul className="mb-4 text-sm" style={{ color: "var(--muted2)" }}>
          {(resources ?? []).map((r) => (
            <li key={r.id}>
              {r.title as string} · {(r.resource_type as string).toUpperCase()}
              {r.storage_path ? ` · ${r.storage_path as string}` : ""}
            </li>
          ))}
        </ul>
        <form action={createResource} className="flex flex-col gap-2">
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="Resource title"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <select
            name="resource_type"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <input
            name="storage_path"
            placeholder="Storage path in course-resources bucket (e.g. course-id/file.pdf)"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="external_url"
            placeholder="Or external URL"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="meta"
            placeholder="Meta (e.g. file size)"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button type="submit" className="btn-primary w-fit rounded-lg px-4 py-2 text-sm">
            Add resource
          </button>
        </form>
      </section>

      <section className="card rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">Submissions</h2>
        <div className="space-y-4">
          {(submissions ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted2)" }}>
              No submissions yet.
            </p>
          ) : (
            (submissions ?? []).map((s) => {
              const title =
                titleByAssignment.get(s.assignment_id as string) ?? "Assignment";
              return (
                <div
                  key={s.id as string}
                  className="border-b pb-4 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="font-medium">{title}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {(s.status as string) ?? ""} · {(s.file_path as string) ?? "—"}
                  </div>
                  {(s.status as string) === "submitted" ? (
                    <form action={gradeSubmission} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="submission_id" value={s.id as string} />
                      <input type="hidden" name="assignment_id" value={s.assignment_id as string} />
                      <input type="hidden" name="course_id" value={courseId} />
                      <input
                        name="grade"
                        placeholder="Grade (e.g. A)"
                        className="w-24 rounded border px-2 py-1 text-xs"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                      <input
                        name="feedback"
                        placeholder="Feedback"
                        className="min-w-[200px] flex-1 rounded border px-2 py-1 text-xs"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                      <button type="submit" className="btn-primary rounded px-3 py-1 text-xs">
                        Grade
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
