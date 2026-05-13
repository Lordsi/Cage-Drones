import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { AssignmentSubmitForm } from "@/components/assignment-submit-form";

export default async function PortalAssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id as string);

  const { data: assignments } = courseIds.length
    ? await supabase
        .from("assignments")
        .select("id, title, instructions, due_at, course_id, courses ( title )")
        .in("course_id", courseIds)
        .order("due_at", { ascending: true })
    : { data: [] as Record<string, unknown>[] };

  const { data: subs } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, status, grade, feedback, file_path, submitted_at")
    .eq("user_id", user.id);

  const subByAssign = new Map(
    (subs ?? []).map((s) => [
      s.assignment_id as string,
      s as {
        status: string;
        grade: string | null;
        feedback: string | null;
        file_path: string | null;
        submitted_at: string | null;
      },
    ]),
  );

  const now = new Date();

  return (
    <div>
      <div className="mb-8">
        <div
          className="font-display mb-1 text-[0.7rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Coursework
        </div>
        <h1 className="display text-3xl font-extrabold">Assignments</h1>
      </div>

      <div className="flex flex-col gap-3">
        {(assignments ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No assignments for your courses.
          </p>
        ) : (
          (assignments ?? []).map((raw) => {
            const a = raw as {
              id: string;
              title: string;
              instructions: string | null;
              due_at: string | null;
              courses: { title: string } | null;
            };
            const sub = subByAssign.get(a.id);
            const status = sub?.status ?? "pending";
            const dueDate = a.due_at ? new Date(a.due_at) : null;
            const isLate =
              dueDate && dueDate < now && status === "pending";

            const badge =
              status === "graded" ? (
                <span className="badge badge-green">Graded</span>
              ) : status === "submitted" ? (
                <span className="badge badge-cyan">Submitted</span>
              ) : isLate ? (
                <span className="badge badge-orange">Overdue</span>
              ) : (
                <span className="badge badge-orange">Pending</span>
              );

            return (
              <div
                key={a.id}
                className="card rounded-2xl px-6 py-5"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      background: "rgba(155,126,245,.1)",
                      borderColor: "rgba(155,126,245,.2)",
                    }}
                  >
                    <BookOpen size={18} color="var(--purple)" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.title}</span>
                      {badge}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted2)" }}>
                      {a.courses?.title ?? "Course"}
                      {a.due_at
                        ? ` · Due ${new Date(a.due_at).toLocaleDateString()}`
                        : ""}
                    </div>
                  </div>
                  {sub?.grade ? (
                    <div
                      className="display text-2xl font-black"
                      style={{ color: "var(--green)" }}
                    >
                      {sub.grade}
                    </div>
                  ) : null}
                  {status === "pending" ? (
                    <AssignmentSubmitForm
                      assignmentId={a.id}
                      userId={user.id}
                    />
                  ) : null}
                </div>

                {/* Instructions */}
                {a.instructions && (
                  <div
                    className="mt-3 rounded-md border px-4 py-3 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--muted2)",
                      background: "var(--deep)",
                    }}
                  >
                    <span
                      className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--muted)" }}
                    >
                      Instructions
                    </span>
                    <p className="whitespace-pre-wrap">{a.instructions}</p>
                  </div>
                )}

                {/* Feedback from teacher */}
                {sub?.feedback && (
                  <div
                    className="mt-3 rounded-md border px-4 py-3 text-sm"
                    style={{
                      borderColor: "color-mix(in srgb, var(--green) 30%, var(--border))",
                      color: "var(--muted2)",
                      background: "color-mix(in srgb, var(--green) 5%, var(--deep))",
                    }}
                  >
                    <span
                      className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--green)" }}
                    >
                      Teacher feedback
                    </span>
                    <p className="whitespace-pre-wrap">{sub.feedback}</p>
                  </div>
                )}

                {/* Submitted file info + resubmit */}
                {sub?.submitted_at && status !== "graded" && (
                  <div
                    className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    <span>
                      Submitted{" "}
                      {new Date(sub.submitted_at).toLocaleString()}
                      {sub.file_path ? ` · ${sub.file_path.split("/").pop()}` : ""}
                    </span>
                    <AssignmentSubmitForm
                      assignmentId={a.id}
                      userId={user.id}
                      resubmit
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
