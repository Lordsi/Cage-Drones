import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import {
  BookOpen,
  FileText,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
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

  const statCards = [
    { label: "Courses Enrolled", val: String(courseIds.length), icon: BookOpen, color: "var(--accent)" },
    { label: "Published Exams", val: String(examsAvailable), icon: FileText, color: "var(--green)" },
    { label: "Assignments Due", val: String(assignmentsDue), icon: Clock, color: assignmentsDue > 0 ? "var(--red)" : "var(--muted)" },
    { label: "Test Average", val: avgScore != null ? `${avgScore}%` : "—", icon: Star, color: "var(--orange)" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Student Telemetry
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Welcome back, {profile.display_name}. Your flight readiness is currently optimized.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {s.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>
                <s.icon size={16} style={{ color: s.color }} strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        {/* Upcoming sessions */}
        <div className="card p-6 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>Upcoming Sessions</h2>
            <Link href="/portal/assignments" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              View All <ChevronRight size={14} className="inline" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No upcoming due dates. Check{" "}
              <Link href="/portal/exams" className="underline" style={{ color: "var(--accent)" }}>exams</Link>{" "}
              for available tests.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((u) => (
                <li key={u.id} className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="mt-0.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--green)", width: "3px", height: "100%", minHeight: "2rem", borderRadius: "2px" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{u.title}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {u.courseTitle}
                    </div>
                    <div className="mt-1 text-[0.7rem] font-medium uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      {new Date(u.dueAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity / announcements */}
        <div className="card p-6 xl:col-span-1">
          <h2 className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>Recent Activity</h2>
          {(announcements ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
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
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.pinned ? "var(--orange)" : "var(--green)" }} />
                    <div>
                      <div className="text-[0.68rem] font-medium uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                        {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{a.title}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {courseTitle(a.courses)}
                      </div>
                      {a.body ? (
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                          {a.body.slice(0, 120)}{a.body.length > 120 ? "…" : ""}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* My courses */}
        <div className="card p-6 xl:col-span-1">
          <h2 className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>My Courses</h2>
          {(enrollments ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              You are not enrolled in any course yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {(enrollments ?? []).map((e) => {
                const raw = e.courses as unknown;
                const c = (Array.isArray(raw) ? raw[0] : raw) as {
                  id: string;
                  title: string;
                } | null;
                return (
                  <li
                    key={e.course_id}
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <CheckCircle2 size={16} style={{ color: "var(--green)" }} />
                    <span className="font-medium" style={{ color: "var(--text)" }}>
                      {c?.title ?? "Course"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/exams">
            <button type="button" className="btn-ghost px-4 py-2.5 text-sm" style={{ borderRadius: "4px" }}>
              Take an Exam
            </button>
          </Link>
          <Link href="/portal/assignments">
            <button type="button" className="btn-ghost px-4 py-2.5 text-sm" style={{ borderRadius: "4px" }}>
              View Assignments
            </button>
          </Link>
          <Link href="/portal/resources">
            <button type="button" className="btn-ghost px-4 py-2.5 text-sm" style={{ borderRadius: "4px" }}>
              Browse Resources
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
