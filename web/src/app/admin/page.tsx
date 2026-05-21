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
  CheckCircle2,
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
    { data: roleCounts },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("exams").select("*", { count: "exact", head: true }),
    supabase.from("assignments").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("resources").select("*", { count: "exact", head: true }),
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
    { label: "Total Users", value: userCount ?? 0, icon: Users, color: "var(--accent)" },
    { label: "Courses", value: courseCount ?? 0, icon: BookOpen, color: "var(--green)" },
    { label: "Exams", value: examCount ?? 0, icon: FileText, color: "var(--blue)" },
    { label: "Assignments", value: assignmentCount ?? 0, icon: GraduationCap, color: "var(--orange)" },
    { label: "Enrollments", value: enrollmentCount ?? 0, icon: UserPlus, color: "var(--purple)" },
    { label: "Resources", value: resourceCount ?? 0, icon: Layers, color: "var(--muted)" },
  ];

  const roles = roleCounts ?? { student: 0, instructor: 0, admin: 0 };
  const totalRoles = roles.student + roles.instructor + roles.admin;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Operations Overview</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Real-time platform intelligence & user telemetry
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>
              <s.icon size={17} style={{ color: s.color }} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.value}</div>
            <div className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role breakdown */}
        <div className="card p-6">
          <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Users by Role
          </h2>
          <div className="space-y-4">
            {[
              { label: "Students", count: roles.student, color: "var(--accent)" },
              { label: "Instructors", count: roles.instructor, color: "var(--green)" },
              { label: "Admins", count: roles.admin, color: "var(--orange)" },
            ].map((r) => {
              const pct = totalRoles > 0 ? (r.count / totalRoles) * 100 : 0;
              return (
                <div key={r.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium" style={{ color: "var(--text)" }}>{r.label}</span>
                    <span className="font-medium" style={{ color: r.color, fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>{r.count}</span>
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
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Recent Users
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
              <p className="text-sm" style={{ color: "var(--muted)" }}>No users yet.</p>
            ) : (
              (recentUsers ?? []).map((u) => (
                <div
                  key={u.id as string}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {((u.display_name as string) ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
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
                    {u.role === "instructor" ? "instructor" : (u.role as string)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--green) 10%, transparent)" }}>
            <CheckCircle2 size={20} style={{ color: "var(--green)" }} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>All Systems Operational</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>Database, auth, and storage services running normally</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
            <Shield size={20} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Safety Protocols Active</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>All security and access control measures enabled</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/users"
            className="card group flex items-center gap-4 p-5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
              <Users size={18} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Manage Users & Roles</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Assign student, teacher, or admin roles
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/teacher"
            className="card group flex items-center gap-4 p-5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--green) 10%, transparent)" }}>
              <School size={18} style={{ color: "var(--green)" }} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Teacher Portal</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Manage courses, assignments, and exams
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted)" }} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/portal"
            className="card group flex items-center gap-4 p-5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--purple) 10%, transparent)" }}>
              <GraduationCap size={18} style={{ color: "var(--purple)" }} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Student Portal</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
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
