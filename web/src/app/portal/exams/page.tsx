import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileText, CheckCircle } from "lucide-react";
import { startExamFromForm } from "@/app/actions/exams";

export default async function PortalExamsPage() {
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

  const { data: exams } = courseIds.length
    ? await supabase
        .from("exams")
        .select("id, title, duration_minutes, course_id, courses ( title )")
        .in("course_id", courseIds)
        .eq("published", true)
        .order("title")
    : { data: [] as Record<string, unknown>[] };

  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("id, exam_id, submitted_at, score_percent, started_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  type Attempt = {
    id: string;
    exam_id: string;
    submitted_at: string | null;
    score_percent: number | null;
  };

  const byExamOpen = new Map<string, string>();
  const byExamLastDone = new Map<string, { id: string; score: number }>();

  for (const a of (attempts ?? []) as Attempt[]) {
    if (!a.submitted_at && !byExamOpen.has(a.exam_id)) {
      byExamOpen.set(a.exam_id, a.id);
    }
    if (a.submitted_at && a.score_percent != null && !byExamLastDone.has(a.exam_id)) {
      byExamLastDone.set(a.exam_id, { id: a.id, score: a.score_percent });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div
          className="font-display mb-1 text-[0.7rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Assessment centre
        </div>
        <h1 className="display text-3xl font-extrabold">My exams</h1>
      </div>

      <div className="flex flex-col gap-4">
        {(exams ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No published exams for your courses yet.
          </p>
        ) : (
          (exams ?? []).map((raw) => {
            const e = raw as {
              id: string;
              title: string;
              duration_minutes: number;
              courses: { title: string } | null;
            };
            const openId = byExamOpen.get(e.id);
            const last = byExamLastDone.get(e.id);
            return (
              <div
                key={e.id}
                className="card flex flex-wrap items-center gap-4 rounded-2xl p-6"
              >
                <div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border"
                  style={{
                    background: "rgba(0,198,255,.08)",
                    borderColor: "rgba(0,198,255,.15)",
                  }}
                >
                  <FileText size={22} color="var(--cyan)" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="display text-lg font-bold">{e.title}</span>
                    {last ? (
                      <span className="badge badge-green">
                        <CheckCircle size={10} />
                        Last score · {last.score}%
                      </span>
                    ) : (
                      <span className="badge badge-cyan">Available</span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: "var(--muted2)" }}>
                    {e.courses?.title ?? "Course"} · {e.duration_minutes} min
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {openId ? (
                    <Link href={`/exam/${openId}`}>
                      <button type="button" className="btn-primary rounded-lg px-5 py-2 text-sm">
                        Resume
                      </button>
                    </Link>
                  ) : (
                    <form action={startExamFromForm}>
                      <input type="hidden" name="exam_id" value={e.id} />
                      <button type="submit" className="btn-primary rounded-lg px-5 py-2 text-sm">
                        Start exam
                      </button>
                    </form>
                  )}
                  {last ? (
                    <Link href={`/exam/${last.id}`}>
                      <button type="button" className="btn-ghost rounded-lg px-4 py-2 text-sm">
                        Review last
                      </button>
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
