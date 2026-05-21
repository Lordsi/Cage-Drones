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
      className="sticky top-0 flex h-screen w-[220px] flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="p-4 pb-3">
        <Link href="/portal" className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: "var(--accent)" }}>CAGE</span>
        </Link>
        <div className="mt-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Academic Management
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {NAV.map((n) => {
          const active = n.match.test(pathname);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`sb-link ${active ? "active" : ""}`}
            >
              <n.icon size={16} strokeWidth={1.5} />
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
              <School size={16} strokeWidth={1.5} />
              <span className="text-sm">Teacher portal</span>
            </Link>
            <Link
              href="/admin"
              className={`sb-link ${pathname.startsWith("/admin") ? "active" : ""}`}
            >
              <Shield size={16} strokeWidth={1.5} />
              <span className="text-sm">Administration</span>
            </Link>
          </>
        ) : null}
      </nav>

      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
              {displayName}
            </div>
            <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {roleDisplayLabel(role)}
            </div>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="sb-link w-full"
            style={{ color: "var(--red)" }}
          >
            <LogOut size={15} strokeWidth={1.5} />
            <span className="text-sm">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
