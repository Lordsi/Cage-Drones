"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  Layers,
  FileText,
  LogOut,
  Shield,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { UserRole } from "@/lib/profile";

type Course = { id: string; title: string };

function courseNav(courseId: string) {
  return [
    { href: `/teacher/courses/${courseId}`, label: "Overview", icon: Home, exact: true },
    { href: `/teacher/courses/${courseId}/students`, label: "Students", icon: Users },
    { href: `/teacher/courses/${courseId}/assignments`, label: "Assignments", icon: BookOpen },
    { href: `/teacher/courses/${courseId}/gradebook`, label: "Gradebook", icon: BarChart3 },
    { href: `/teacher/courses/${courseId}/resources`, label: "Resources", icon: Layers },
    { href: `/teacher/courses/${courseId}/exams`, label: "Exams", icon: FileText },
  ];
}

export function TeacherSidebar({
  courses,
  displayName,
  role,
}: {
  courses: Course[];
  displayName: string;
  role: UserRole;
}) {
  const pathname = usePathname();

  const courseMatch = pathname.match(/^\/teacher\/courses\/([^/]+)/);
  const activeCourseId = courseMatch?.[1] ?? null;
  const activeCourse = activeCourseId
    ? courses.find((c) => c.id === activeCourseId)
    : null;

  return (
    <aside
      className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="p-4 pb-2">
        <Link
          href="/teacher"
          className="flex items-center gap-2"
        >
          <span className="text-base font-bold" style={{ color: "var(--accent)" }}>CAGE</span>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Portal</span>
        </Link>
        <div className="mt-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Academic Management
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <Link
          href="/teacher"
          className={`sb-link mb-0.5 ${pathname === "/teacher" ? "active" : ""}`}
        >
          <Home size={15} strokeWidth={1.5} />
          <span className="text-sm">All courses</span>
        </Link>

        {role === "admin" && (
          <Link
            href="/admin"
            className="sb-link mb-0.5"
          >
            <Shield size={15} strokeWidth={1.5} />
            <span className="text-sm">Admin</span>
          </Link>
        )}

        {activeCourse && (
          <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <p
              className="mb-2 truncate px-3 text-[0.6rem] font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              title={activeCourse.title}
            >
              {activeCourse.title}
            </p>
            {courseNav(activeCourse.id).map((n) => {
              const isActive = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`sb-link mb-0.5 ${isActive ? "active" : ""}`}
                >
                  <n.icon size={14} strokeWidth={1.5} />
                  <span className="text-sm">{n.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {courses.length > 1 && (
          <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <p
              className="mb-2 px-3 text-[0.6rem] font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              Courses
            </p>
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/teacher/courses/${c.id}`}
                className={`mb-0.5 block truncate rounded px-3 py-1.5 text-sm transition-colors ${
                  c.id === activeCourseId
                    ? "font-medium text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                title={c.title}
              >
                {c.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>{displayName}</div>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="sb-link w-full"
            style={{ color: "var(--red)" }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span className="text-sm">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
