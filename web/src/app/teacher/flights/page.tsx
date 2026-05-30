import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function TeacherFlightsPage() {
  const supabase = await createClient();

  const { data: flights } = await supabase
    .from("flights")
    .select(
      "id, mission_type, location, departure_at, status, review_status, pilot:pilot_id ( id, display_name ), aircraft:aircraft_id ( registration )",
    )
    .order("departure_at", { ascending: false, nullsFirst: false })
    .limit(200);

  type Row = (NonNullable<typeof flights>)[number];
  const groups: Record<string, Row[]> = {
    needs_attention: [],
    unreviewed: [],
    approved: [],
  };
  for (const f of flights ?? []) {
    const key = (f.review_status as string) || "unreviewed";
    if (key in groups) groups[key].push(f);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Flight Reviews
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Review pilot flights, post-flight checklists, and submit evaluations.
        </p>
      </div>

      <Section title="Awaiting review" tone="orange" rows={groups.unreviewed} />
      <Section title="Needs attention" tone="red" rows={groups.needs_attention} />
      <Section title="Approved" tone="green" rows={groups.approved} />
    </div>
  );
}

function Section({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "orange" | "red" | "green";
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        {title} ({rows.length})
      </h2>
      {rows.length === 0 ? (
        <p className="card p-4 text-sm" style={{ color: "var(--muted)" }}>None.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((f) => {
            const pilot = f.pilot as { display_name?: string } | null;
            const ac = f.aircraft as { registration?: string } | null;
            return (
              <Link
                key={f.id as string}
                href={`/teacher/flights/${f.id as string}`}
                className="card flex items-center justify-between gap-4 p-4 transition-colors hover:border-[var(--accent)]"
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {(f.mission_type as string) || "Flight"} · {(f.location as string) || "—"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                    {pilot?.display_name ?? "—"}
                    {ac?.registration ? ` · ${ac.registration}` : ""}
                    {f.departure_at
                      ? ` · ${new Date(f.departure_at as string).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}`
                      : ""}
                  </div>
                </div>
                <span
                  className={`badge ${
                    tone === "orange" ? "badge-orange" : tone === "red" ? "badge-red" : "badge-green"
                  }`}
                >
                  {tone === "red" ? (
                    <>
                      <AlertTriangle size={10} /> attention
                    </>
                  ) : tone === "green" ? (
                    <>
                      <CheckCircle2 size={10} /> approved
                    </>
                  ) : (
                    <>{f.status as string}</>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
