"use client";

import { useEffect, useState } from "react";
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
  Plane,
  Award,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { UserRole } from "@/lib/profile";
import { roleDisplayLabel } from "@/lib/profile";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: Home, match: /^\/portal$/ },
  { href: "/portal/exams", label: "Exams", icon: FileText, match: /^\/portal\/exams/ },
  { href: "/portal/assignments", label: "Assignments", icon: BookOpen, match: /^\/portal\/assignments/ },
  { href: "/portal/grades", label: "Grades & results", icon: GraduationCap, match: /^\/portal\/grades/ },
  { href: "/portal/resources", label: "Resources", icon: Layers, match: /^\/portal\/resources/ },
  { href: "/portal/flights", label: "Flight logbook", icon: Plane, match: /^\/portal\/flights/ },
  { href: "/portal/certificates", label: "Certificates", icon: Award, match: /^\/portal\/certificates/ },
];

export function PortalShell({
  displayName,
  role,
  children,
}: {
  displayName: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="app-shell">
      <aside className="app-sidebar" data-open={open ? "true" : "false"}>
        <div className="flex items-center justify-between p-4 pb-3">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight" style={{ color: "var(--accent)" }}>
              CAGE
            </span>
            <span className="t-label">Portal</span>
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

        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-1">
          {NAV.map((n) => {
            const active = n.match.test(pathname);
            return (
              <Link key={n.href} href={n.href} className={`sb-link ${active ? "active" : ""}`}>
                <n.icon size={16} strokeWidth={1.75} />
                <span>{n.label}</span>
              </Link>
            );
          })}
          {isAdmin ? (
            <>
              <div className="divider my-2" />
              <Link href="/teacher" className={`sb-link ${pathname.startsWith("/teacher") ? "active" : ""}`}>
                <School size={16} strokeWidth={1.75} />
                <span>Teacher portal</span>
              </Link>
              <Link href="/admin" className={`sb-link ${pathname.startsWith("/admin") ? "active" : ""}`}>
                <Shield size={16} strokeWidth={1.75} />
                <span>Administration</span>
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
              <div className="t-label">{roleDisplayLabel(role)}</div>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="sb-link w-full" style={{ color: "var(--red)" }}>
              <LogOut size={15} strokeWidth={1.75} />
              <span>Sign Out</span>
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
            <Link href="/" className="flex items-center gap-2 truncate">
              <span className="font-display text-base font-bold tracking-tight md:hidden" style={{ color: "var(--accent)" }}>
                CAGE
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="icon-btn" title="Home">
              <Home size={17} strokeWidth={1.75} />
            </Link>
            <span className="icon-btn" style={{ opacity: 0.45 }} title="Notifications (coming soon)">
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
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
