import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="display mb-4 text-2xl font-extrabold">Administration</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted2)" }}>
        Manage user roles and open other portals as needed.
      </p>
      <Link
        href="/admin/users"
        className="card inline-flex rounded-xl px-6 py-4 font-semibold transition hover-accent-dim"
      >
        Users & roles →
      </Link>
    </div>
  );
}
