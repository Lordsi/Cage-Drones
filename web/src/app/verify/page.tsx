import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ serial?: string }>;
}) {
  const sp = await searchParams;
  const serial = (sp.serial ?? "").trim();
  if (serial) redirect(`/certificate/${encodeURIComponent(serial)}`);

  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      <div className="mx-auto max-w-xl px-6 py-16">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← CAGE
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Verify a CAGE Certificate
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Enter the serial printed on the certificate to look it up.
        </p>

        <form method="GET" action="/verify" className="mt-6 flex gap-2">
          <input
            name="serial"
            required
            placeholder="CAGE-2026-XXXX-XXXX-XXXX"
            className="flex-1 rounded border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--card)",
              borderColor: "var(--input-border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          />
          <button type="submit" className="btn-primary px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
