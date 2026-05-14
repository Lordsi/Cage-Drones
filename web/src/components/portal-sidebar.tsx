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
  Menu,
  X,
  ExternalLink,
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const content = (
    <>
      <div className="mb-8 flex items-center gap-2 px-1">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          C
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">CAGE Portal</div>
        </div>
      </div>

      <div
        className="mb-2 text-[0.65rem] uppercase tracking-widest"
        style={{ color: "var(--muted)" }}
      >
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
        <Link href="/" className="sb-link">
          <ExternalLink size={16} />
          <span className="text-sm">Back to site</span>
        </Link>
        <div className="divider my-3" />
        <div className="mb-2 flex items-center gap-3 px-1">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{displayName}</div>
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 md:hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/portal" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            C
          </div>
          <span className="text-sm font-bold">CAGE Portal</span>
        </Link>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ color: "var(--muted2)" }}
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r p-5 md:flex"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
          />
          <aside
            className="absolute inset-y-0 left-0 flex h-full w-[82%] max-w-[300px] flex-col border-r p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md"
              style={{ color: "var(--muted2)" }}
            >
              <X size={20} />
            </button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
