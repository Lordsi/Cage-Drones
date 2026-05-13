import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/app/actions/assignments";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const { courseId, assignmentId } = await params;
  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("id, title, instructions, due_at")
    .eq("id", assignmentId)
    .eq("course_id", courseId)
    .single();
  if (error || !assignment) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, profiles ( display_name )")
    .eq("course_id", courseId);

  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("id, user_id, status, grade, feedback, file_path, submitted_at")
    .eq("assignment_id", assignmentId);

  const subsByUser = new Map<string, Record<string, unknown>>();
  for (const s of submissions ?? []) {
    subsByUser.set(s.user_id as string, s);
  }

  const signedUrls = new Map<string, string>();
  for (const s of submissions ?? []) {
    const fp = s.file_path as string | null;
    if (fp) {
      const { data: urlData } = await supabase.storage
        .from("assignment-submissions")
        .createSignedUrl(fp, 3600);
      if (urlData?.signedUrl) {
        signedUrls.set(s.id as string, urlData.signedUrl);
      }
    }
  }

  return (
    <div>
      <Link
        href={`/teacher/courses/${courseId}/assignments`}
        className="text-sm hover:underline"
        style={{ color: "var(--accent)" }}
      >
        ← Assignments
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {assignment.title as string}
      </h1>
      {assignment.instructions && (
        <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "var(--muted2)" }}>
          {assignment.instructions as string}
        </p>
      )}
      {assignment.due_at && (
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Due: {new Date(assignment.due_at as string).toLocaleString()}
        </p>
      )}

      {/* Submissions table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="pb-2 font-semibold">Student</th>
              <th className="pb-2 font-semibold">Status</th>
              <th className="pb-2 font-semibold">Submitted</th>
              <th className="pb-2 font-semibold">File</th>
              <th className="pb-2 font-semibold">Grade</th>
              <th className="pb-2 font-semibold">Feedback</th>
              <th className="pb-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {(enrollments ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center"
                  style={{ color: "var(--muted2)" }}
                >
                  No students enrolled.
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
                const sub = subsByUser.get(uid);
                const status = sub ? (sub.status as string) : "not started";
                const submittedAt = sub?.submitted_at as string | null;
                const fileUrl = sub
                  ? signedUrls.get(sub.id as string)
                  : undefined;
                const grade = sub ? (sub.grade as string | null) : null;
                const feedback = sub
                  ? (sub.feedback as string | null)
                  : null;

                const statusColor =
                  status === "graded"
                    ? "var(--green)"
                    : status === "submitted"
                      ? "var(--orange)"
                      : "var(--muted)";

                return (
                  <tr
                    key={uid}
                    className="border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-3 font-medium">{name}</td>
                    <td className="py-3">
                      <span
                        className="text-xs font-semibold uppercase"
                        style={{ color: statusColor }}
                      >
                        {status}
                      </span>
                    </td>
                    <td
                      className="py-3 text-xs"
                      style={{ color: "var(--muted2)" }}
                    >
                      {submittedAt
                        ? new Date(submittedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3">
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: "var(--accent)" }}
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs">{grade ?? "—"}</td>
                    <td
                      className="max-w-[160px] truncate py-3 text-xs"
                      style={{ color: "var(--muted2)" }}
                      title={feedback ?? ""}
                    >
                      {feedback ?? "—"}
                    </td>
                    <td className="py-3">
                      {sub && status === "submitted" ? (
                        <form
                          action={gradeSubmission}
                          className="flex flex-wrap gap-1"
                        >
                          <input
                            type="hidden"
                            name="submission_id"
                            value={sub.id as string}
                          />
                          <input
                            type="hidden"
                            name="assignment_id"
                            value={assignmentId}
                          />
                          <input
                            type="hidden"
                            name="course_id"
                            value={courseId}
                          />
                          <input
                            name="grade"
                            placeholder="Grade"
                            className="w-16 rounded border px-2 py-1 text-xs"
                            style={{
                              background: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                          />
                          <input
                            name="feedback"
                            placeholder="Feedback"
                            className="w-28 rounded border px-2 py-1 text-xs"
                            style={{
                              background: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                          />
                          <button
                            type="submit"
                            className="btn-primary rounded px-2 py-1 text-xs"
                          >
                            Save
                          </button>
                        </form>
                      ) : null}
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
