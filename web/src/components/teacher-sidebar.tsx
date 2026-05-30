"use client";

import { useEffect, useState } from "react";
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
  Plane,
  Calendar,
  Menu,
  X,
  Bell,
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

export function TeacherShell({
  courses,
  displayName,
  role,
  children,
}: {
  courses: Course[];
  displayName: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const courseMatch = pathname.match(/^\/teacher\/courses\/([^/]+)/);
  const activeCourseId = courseMatch?.[1] ?? null;
  const activeCourse = activeCourseId
    ? courses.find((c) => c.id === activeCourseId)
    : null;

  return (
    <div className="app-shell">
      <aside className="app-sidebar" data-open={open ? "true" : "false"}>
        <div className="flex items-center justify-between p-4 pb-2">
          <Link href="/teacher" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight" style={{ color: "var(--accent)" }}>
              CAGE
            </span>
            <span className="t-label">Teacher</span>
          </Link>
          <button
            type="button"
            className="icon-btn icon-btn-mobile-only"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <Link
            href="/teacher"
            className={`sb-link mb-0.5 ${pathname === "/teacher" ? "active" : ""}`}
          >
            <Home size={15} strokeWidth={1.75} />
            <span>All courses</span>
          </Link>

          <Link
            href="/teacher/flights"
            className={`sb-link mb-0.5 ${pathname.startsWith("/teacher/flights") ? "active" : ""}`}
          >
            <Plane size={15} strokeWidth={1.75} />
            <span>Flight reviews</span>
          </Link>

          <Link
            href="/teacher/aircraft"
            className={`sb-link mb-0.5 ${pathname.startsWith("/teacher/aircraft") ? "active" : ""}`}
          >
            <BookOpen size={15} strokeWidth={1.75} />
            <span>Aircraft register</span>
          </Link>

          <Link
            href="/teacher/cohorts"
            className={`sb-link mb-0.5 ${pathname.startsWith("/teacher/cohorts") ? "active" : ""}`}
          >
            <Calendar size={15} strokeWidth={1.75} />
            <span>Cohorts</span>
          </Link>

          {role === "admin" && (
            <Link href="/admin" className="sb-link mb-0.5">
              <Shield size={15} strokeWidth={1.75} />
              <span>Admin</span>
            </Link>
          )}

          {activeCourse && (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <p
                className="t-label mb-2 truncate px-3"
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
                    <n.icon size={14} strokeWidth={1.75} />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {courses.length > 1 && (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <p className="t-label mb-2 px-3">Courses</p>
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
            <button type="submit" className="sb-link w-full" style={{ color: "var(--red)" }}>
              <LogOut size={14} strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      <div
        className="app-scrim"
        data-open={open ? "true" : "false"}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="icon-btn icon-btn-mobile-only"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
            <span className="text-sm font-medium truncate" style={{ color: "var(--muted)" }}>
              {activeCourse ? activeCourse.title : "Dashboard"}
            </span>
            {role === "admin" && (
              <Link href="/admin" className="hidden text-sm font-medium md:inline" style={{ color: "var(--muted2)" }}>
                · Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="icon-btn" title="Home">
              <Home size={17} strokeWidth={1.75} />
            </Link>
            <span className="icon-btn" style={{ opacity: 0.45 }} title="Notifications">
              <Bell size={17} strokeWidth={1.75} />
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{displayName}</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="app-content">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
