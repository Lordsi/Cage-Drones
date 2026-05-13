"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BookOpen,
  Layers,
  LogOut,
  Shield,
  GraduationCap,
  School,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { UserRole } from "@/lib/profile";
import { roleDisplayLabel } from "@/lib/profile";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: Home, match: /^\/portal$/ },
  { href: "/portal/exams", label: "Exams", icon: FileText, match: /^\/portal\/exams/ },
  {
    href: "/portal/assignments",
    label: "Assignments",
    icon: BookOpen,
    match: /^\/portal\/assignments/,
  },
  {
    href: "/portal/grades",
    label: "Grades & results",
    icon: GraduationCap,
    match: /^\/portal\/grades/,
  },
  {
    href: "/portal/resources",
    label: "Resources",
    icon: Layers,
    match: /^\/portal\/resources/,
  },
];

export function PortalSidebar({
  displayName,
  role,
}: {
  displayName: string;
  role: UserRole;
}) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <aside
      className="sticky top-0 flex h-screen w-[240px] flex-col border-r p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-8 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: "var(--accent)", color: "#0a0a0a" }}>C</div>
        <div>
          <div className="text-sm font-bold leading-tight">CAGE Portal</div>
        </div>
      </div>

      <div className="mb-2 text-[0.65rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Navigation
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const active = n.match.test(pathname);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`sb-link ${active ? "active" : ""}`}
            >
              <n.icon size={17} />
              <span className="text-sm">{n.label}</span>
            </Link>
          );
        })}
        {isAdmin ? (
          <>
            <Link
              href="/teacher"
              className={`sb-link ${pathname.startsWith("/teacher") ? "active" : ""}`}
            >
              <School size={17} />
              <span className="text-sm">Teacher portal</span>
            </Link>
            <Link
              href="/admin"
              className={`sb-link ${pathname.startsWith("/admin") ? "active" : ""}`}
            >
              <Shield size={17} />
              <span className="text-sm">Administration</span>
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-auto">
        <div className="divider my-3" />
        <div className="mb-2 flex items-center gap-3 px-1">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "var(--accent)", color: "#0a0a0a" }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">{displayName}</div>
            <div className="text-[0.7rem]" style={{ color: "var(--muted)" }}>
              {roleDisplayLabel(role)}
            </div>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="sb-link w-full text-[var(--orange)]"
            style={{ color: "var(--orange)" }}
          >
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
