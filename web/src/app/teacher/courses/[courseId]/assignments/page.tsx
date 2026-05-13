import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAssignment } from "@/app/actions/teacher";

export default async function AssignmentsPage({
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

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, instructions, due_at, created_at")
    .eq("course_id", courseId)
    .order("due_at", { ascending: true });

  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  const assignmentIds = (assignments ?? []).map((a) => a.id as string);
  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("assignment_id, status, grade")
        .in("assignment_id", assignmentIds)
    : { data: [] as Record<string, unknown>[] };

  const subsByAssignment = new Map<
    string,
    { total: number; graded: number; grades: string[] }
  >();
  for (const s of submissions ?? []) {
    const aid = s.assignment_id as string;
    const entry = subsByAssignment.get(aid) ?? {
      total: 0,
      graded: 0,
      grades: [],
    };
    entry.total++;
    if ((s.status as string) === "graded") {
      entry.graded++;
      if (s.grade) entry.grades.push(s.grade as string);
    }
    subsByAssignment.set(aid, entry);
  }

  return (
    <div>
      <h1 className="display text-2xl font-extrabold">Assignments</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string}
      </p>

      {/* Create form */}
      <form
        action={createAssignment}
        className="mt-6 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <input type="hidden" name="course_id" value={courseId} />
        <h2
          className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          New assignment
        </h2>
        <div className="flex flex-col gap-2">
          <input
            name="title"
            required
            placeholder="Assignment title"
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="instructions"
            placeholder="Instructions (optional)"
            rows={2}
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label
                className="mb-1 block text-xs"
                style={{ color: "var(--muted2)" }}
              >
                Due date
              </label>
              <input
                name="due_at"
                type="datetime-local"
                className="rounded-md border px-3 py-2 text-sm"
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
              Add assignment
            </button>
          </div>
        </div>
      </form>

      {/* Assignments list */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="pb-2 font-semibold">Title</th>
              <th className="pb-2 font-semibold">Due</th>
              <th className="pb-2 text-center font-semibold">Submissions</th>
              <th className="pb-2 text-center font-semibold">Graded</th>
            </tr>
          </thead>
          <tbody>
            {(assignments ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center"
                  style={{ color: "var(--muted2)" }}
                >
                  No assignments yet.
                </td>
              </tr>
            ) : (
              (assignments ?? []).map((a) => {
                const aid = a.id as string;
                const stats = subsByAssignment.get(aid);
                return (
                  <tr
                    key={aid}
                    className="border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-3">
                      <Link
                        href={`/teacher/courses/${courseId}/assignments/${aid}`}
                        className="font-medium hover:text-[var(--accent)]"
                      >
                        {a.title as string}
                      </Link>
                    </td>
                    <td
                      className="py-3 text-xs"
                      style={{ color: "var(--muted2)" }}
                    >
                      {a.due_at
                        ? new Date(a.due_at as string).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 text-center">
                      {stats
                        ? `${stats.total} / ${enrolledCount ?? 0}`
                        : `0 / ${enrolledCount ?? 0}`}
                    </td>
                    <td className="py-3 text-center">
                      {stats ? stats.graded : 0}
                    </td>
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
