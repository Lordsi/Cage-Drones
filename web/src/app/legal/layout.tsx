import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: "var(--accent)" }}>CAGE</span>
          <span className="text-sm" style={{ color: "var(--muted)" }}>Policies</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm" style={{ color: "var(--muted2)" }}>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/safety">Safety</Link>
          <Link href="/legal/careers">Careers</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <article
          className="legal-article rounded-lg border p-5 sm:p-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {children}
        </article>
      </main>
    </div>
  );
}
