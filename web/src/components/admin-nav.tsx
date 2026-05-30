"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/outbox", label: "Outbox" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="scroll-nav" aria-label="Admin sections">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} data-active={active ? "true" : undefined}>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
