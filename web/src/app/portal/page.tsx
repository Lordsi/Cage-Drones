import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import {
  BookOpen,
  FileText,
  AlertCircle,
  TrendingUp,
  Megaphone,
  CalendarDays,
} from "lucide-react";

type CourseTitle = { title: string };

function courseTitle(raw: unknown): string {
  const c = (Array.isArray(raw) ? raw[0] : raw) as CourseTitle | null;
  return c?.title ?? "Course";
}

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase);
  if (!profile) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses ( id, title )")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id as string);

  let examsAvailable = 0;
  let assignmentsDue = 0;
  let avgScore: number | null = null;
  type UpcomingRow = {
    id: string;
    kind: "assignment";
    title: string;
    courseTitle: string;
    dueAt: string;
  };
  const upcoming: UpcomingRow[] = [];

  const { data: announcements } = courseIds.length
    ? await supabase
        .from("announcements")
        .select("id, title, body, pinned, created_at, course_id, courses ( title )")
        .in("course_id", courseIds)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] as Record<string, unknown>[] };

  if (courseIds.length) {
    const { count } = await supabase
      .from("exams")
      .select("id", { count: "exact", head: true })
      .in("course_id", courseIds)
      .eq("published", true);
    examsAvailable = count ?? 0;

    const { data: allAssigns } = await supabase
      .from("assignments")
      .select("id, title, due_at, course_id, courses ( title )")
      .in("course_id", courseIds)
      .order("due_at", { ascending: true });

    const { data: subs } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, status")
      .eq("user_id", user.id);

    const subMap = new Map((subs ?? []).map((s) => [s.assignment_id, s.status]));
    const now = new Date();

    for (const a of allAssigns ?? []) {
      const st = subMap.get(a.id);
      const due = a.due_at ? new Date(a.due_at as string) : null;
      if (!due || due < now) continue;
      if (st === "submitted" || st === "graded") continue;
      assignmentsDue += 1;
      if (upcoming.length < 12) {
        upcoming.push({
          id: a.id as string,
          kind: "assignment",
          title: a.title as string,
          courseTitle: courseTitle(a.courses),
          dueAt: a.due_at as string,
        });
      }
    }

    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("score_percent")
      .eq("user_id", user.id)
      .not("score_percent", "is", null);

    const scores = (attempts ?? []).map((a) => a.score_percent as number);
    if (scores.length) {
      avgScore = Math.round(scores.reduce((x, y) => x + y, 0) / scores.length);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div
          className="font-display mb-1 text-[0.7rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Welcome back
        </div>
        <h1 className="display text-3xl font-extrabold">
          Hello, <span style={{ color: "var(--cyan)" }}>{profile.display_name}</span>
        </h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Courses enrolled",
            val: String(courseIds.length),
            icon: BookOpen,
            color: "#00C6FF",
          },
          {
            label: "Published exams",
            val: String(examsAvailable),
            icon: FileText,
            color: "#22D3A3",
          },
          {
            label: "Assignments due",
            val: String(assignmentsDue),
            icon: AlertCircle,
            color: "#FF6535",
          },
          {
            label: "Avg score",
            val: avgScore != null ? `${avgScore}%` : "—",
            icon: TrendingUp,
            color: "#9B7EF5",
          },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted2)" }}>
                {s.label}
              </span>
              <s.icon size={16} color={s.color} />
            </div>
            <div className="display text-3xl font-black" style={{ color: s.color }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="card rounded-2xl p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={18} color="var(--cyan)" />
            <h2 className="display text-lg font-bold">Upcoming</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted2)" }}>
              No upcoming due dates with open work. Check{" "}
              <Link href="/portal/exams" className="underline" style={{ color: "var(--cyan)" }}>
                exams
              </Link>{" "}
              for available tests.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((u) => (
                <li
                  key={u.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="font-medium">{u.title}</div>
                  <div className="text-xs" style={{ color: "var(--muted2)" }}>
                    {u.courseTitle} · Due {new Date(u.dueAt).toLocaleString()}
                  </div>
                  <Link
                    href="/portal/assignments"
                    className="mt-1 inline-block text-xs underline"
                    style={{ color: "var(--cyan)" }}
                  >
                    Go to assignments
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card rounded-2xl p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={18} color="var(--yellow)" />
            <h2 className="display text-lg font-bold">Announcements</h2>
          </div>
          {(announcements ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted2)" }}>
              No announcements from your instructors yet.
            </p>
          ) : (
            <ul className="max-h-[340px] space-y-4 overflow-y-auto pr-1">
              {(announcements ?? []).map((row) => {
                const a = row as {
                  id: string;
                  title: string;
                  body: string;
                  pinned: boolean;
                  created_at: string;
                  courses: unknown;
                };
                return (
                  <li
                    key={a.id}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {a.pinned ? (
                      <span className="badge badge-orange mb-1">Pinned</span>
                    ) : null}
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {courseTitle(a.courses)} · {new Date(a.created_at).toLocaleDateString()}
                    </div>
                    {a.body ? (
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--muted2)" }}>
                        {a.body}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card rounded-2xl p-5 xl:col-span-1">
          <h2 className="display mb-4 text-lg font-bold">My courses</h2>
          {(enrollments ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted2)" }}>
              You are not enrolled in any course yet. Ask your instructor to add your account ID to
              a course.
            </p>
          ) : (
            <ul className="space-y-3">
              {(enrollments ?? []).map((e) => {
                const raw = e.courses as unknown;
                const c = (Array.isArray(raw) ? raw[0] : raw) as {
                  title: string;
                } | null;
                return (
                  <li
                    key={e.course_id}
                    className="rounded-lg border px-4 py-3 text-sm font-medium"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {c?.title ?? "Course"}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <h2 className="display mb-4 text-lg font-bold">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/exams">
            <button type="button" className="btn-ghost rounded-lg px-4 py-3 text-sm">
              Take an exam
            </button>
          </Link>
          <Link href="/portal/assignments">
            <button type="button" className="btn-ghost rounded-lg px-4 py-3 text-sm">
              View assignments
            </button>
          </Link>
          <Link href="/portal/resources">
            <button type="button" className="btn-ghost rounded-lg px-4 py-3 text-sm">
              Browse resources
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
