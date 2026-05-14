import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  ArrowRight,
  Shield,
  School,
  UserPlus,
  ListChecks,
} from "lucide-react";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: courseCount },
    { count: examCount },
    { count: assignmentCount },
    { count: enrollmentCount },
    { count: resourceCount },
    { count: allowlistCount },
    { data: roleCounts },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("exams").select("*", { count: "exact", head: true }),
    supabase.from("assignments").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("resources").select("*", { count: "exact", head: true }),
    supabase.from("student_allowlist").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("role")
      .then(({ data }) => {
        const counts = { student: 0, instructor: 0, admin: 0 };
        (data ?? []).forEach((p) => {
          const r = (p as { role: string }).role as keyof typeof counts;
          if (r in counts) counts[r]++;
        });
        return { data: counts };
      }),
    supabase
      .from("profiles")
      .select("id, display_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total users", value: userCount ?? 0, icon: Users },
    { label: "Allow-listed", value: allowlistCount ?? 0, icon: ListChecks },
    { label: "Courses", value: courseCount ?? 0, icon: BookOpen },
    { label: "Exams", value: examCount ?? 0, icon: FileText },
    { label: "Assignments", value: assignmentCount ?? 0, icon: GraduationCap },
    { label: "Enrollments", value: enrollmentCount ?? 0, icon: UserPlus },
    { label: "Resources", value: resourceCount ?? 0, icon: Layers },
  ];

  const roles = roleCounts ?? { student: 0, instructor: 0, admin: 0 };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
          Platform overview and management tools.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card rounded-xl px-4 py-4"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
              <s.icon size={16} style={{ color: "var(--accent)" }} />
            </div>
            <div className="text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role breakdown */}
        <div className="card rounded-xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Users by role
          </h2>
          <div className="space-y-3">
            {[
              { label: "Students", count: roles.student, color: "var(--accent)" },
              { label: "Teachers", count: roles.instructor, color: "var(--green)" },
              { label: "Admins", count: roles.admin, color: "var(--orange)" },
            ].map((r) => {
              const total = roles.student + roles.instructor + roles.admin;
              const pct = total > 0 ? (r.count / total) * 100 : 0;
              return (
                <div key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{r.label}</span>
                    <span style={{ color: "var(--muted2)" }}>{r.count}</span>
                  </div>
                  <div className="prog-track h-1.5">
                    <div
                      className="h-full rounded"
                      style={{ width: `${pct}%`, background: r.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="card rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Recent users
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {(recentUsers ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted2)" }}>No users yet.</p>
            ) : (
              (recentUsers ?? []).map((u) => (
                <div
                  key={u.id as string}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: "color-mix(in srgb, var(--text) 3%, transparent)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {((u.display_name as string) ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">
                      {(u.display_name as string) || "—"}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      u.role === "admin"
                        ? "badge-orange"
                        : u.role === "instructor"
                        ? "badge-green"
                        : "badge-gray"
                    }`}
                  >
                    {u.role === "instructor" ? "teacher" : (u.role as string)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/users"
            className="card group flex items-center gap-4 rounded-xl px-5 py-4 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
              <Users size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Manage users & roles</div>
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                Assign student, teacher, or admin roles
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/allowlist"
            className="card group flex items-center gap-4 rounded-xl px-5 py-4 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--yellow) 10%, transparent)" }}>
              <ListChecks size={18} style={{ color: "var(--yellow)" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Student allow-list</div>
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                Control which emails can register or stay signed in as students
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/teacher"
            className="card group flex items-center gap-4 rounded-xl px-5 py-4 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--green) 10%, transparent)" }}>
              <School size={18} style={{ color: "var(--green)" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Teacher portal</div>
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                Manage courses, assignments, and exams
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/portal"
            className="card group flex items-center gap-4 rounded-xl px-5 py-4 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--purple) 10%, transparent)" }}>
              <Shield size={18} style={{ color: "var(--purple)" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Student portal</div>
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                View the student experience
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
