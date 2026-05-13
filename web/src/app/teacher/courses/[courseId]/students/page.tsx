import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enrollStudentByEmail, unenrollStudent } from "@/app/actions/teacher";

export default async function StudentsPage({
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

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, enrolled_at, profiles ( display_name )")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: true });

  const userIds = (enrollments ?? []).map((e) => e.user_id as string);

  const { data: examAttempts } = userIds.length
    ? await supabase
        .from("exam_attempts")
        .select("user_id, score_percent, exams!inner ( course_id )")
        .in("user_id", userIds)
        .eq("exams.course_id", courseId)
        .not("submitted_at", "is", null)
    : { data: [] as Record<string, unknown>[] };

  const { data: allAssignments } = await supabase
    .from("assignments")
    .select("id")
    .eq("course_id", courseId);
  const assignmentIds = (allAssignments ?? []).map((a) => a.id as string);
  const totalAssignments = assignmentIds.length;

  const { data: allSubmissions } =
    assignmentIds.length && userIds.length
      ? await supabase
          .from("assignment_submissions")
          .select("user_id, status")
          .in("assignment_id", assignmentIds)
          .in("user_id", userIds)
      : { data: [] as Record<string, unknown>[] };

  const scoresByUser = new Map<string, number[]>();
  for (const a of examAttempts ?? []) {
    const uid = a.user_id as string;
    const arr = scoresByUser.get(uid) ?? [];
    arr.push(a.score_percent as number);
    scoresByUser.set(uid, arr);
  }

  const completionByUser = new Map<string, number>();
  for (const s of allSubmissions ?? []) {
    const uid = s.user_id as string;
    const st = s.status as string;
    if (st === "submitted" || st === "graded") {
      completionByUser.set(uid, (completionByUser.get(uid) ?? 0) + 1);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Students</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string} — {(enrollments ?? []).length} enrolled
      </p>

      {/* Enroll by email */}
      <form
        action={enrollStudentByEmail}
        className="mt-6 flex flex-wrap items-end gap-2 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <input type="hidden" name="course_id" value={courseId} />
        <div className="flex-1">
          <label
            className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            Enroll student by email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="student@example.com"
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
          Enroll
        </button>
      </form>

      {/* Roster table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="pb-2 font-semibold">Student</th>
              <th className="pb-2 font-semibold">Enrolled</th>
              <th className="pb-2 text-center font-semibold">Avg. exam</th>
              <th className="pb-2 text-center font-semibold">
                Assignments
              </th>
              <th className="pb-2 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {(enrollments ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center"
                  style={{ color: "var(--muted2)" }}
                >
                  No students enrolled yet.
                </td>
              </tr>
            ) : (
              (enrollments ?? []).map((e) => {
                const uid = e.user_id as string;
                const raw = e.profiles as unknown;
                const p = (Array.isArray(raw) ? raw[0] : raw) as {
                  display_name: string;
                } | null;
                const name = p?.display_name ?? "Student";

                const scores = scoresByUser.get(uid);
                const avg =
                  scores && scores.length > 0
                    ? Math.round(
                        scores.reduce((a, b) => a + b, 0) / scores.length,
                      )
                    : null;

                const completed = completionByUser.get(uid) ?? 0;

                return (
                  <tr
                    key={uid}
                    className="border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-3">
                      <div className="font-medium">{name}</div>
                      <div
                        className="font-mono text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {uid.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="py-3 text-xs" style={{ color: "var(--muted2)" }}>
                      {e.enrolled_at
                        ? new Date(e.enrolled_at as string).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 text-center">
                      {avg != null ? `${avg}%` : "—"}
                    </td>
                    <td className="py-3 text-center">
                      {totalAssignments > 0
                        ? `${completed}/${totalAssignments}`
                        : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <form action={unenrollStudent} className="inline">
                        <input type="hidden" name="course_id" value={courseId} />
                        <input type="hidden" name="user_id" value={uid} />
                        <button
                          type="submit"
                          className="text-xs text-[var(--orange)] hover:underline"
                        >
                          Remove
                        </button>
                      </form>
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
