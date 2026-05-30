import { createClient } from "@/lib/supabase/server";
import { AdminRequestRow } from "@/components/admin-request-row";

const STATUSES = ["pending", "reviewing", "accepted", "waitlisted", "declined", "enrolled"];

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("training_applications")
    .select("*, cohort:cohort_id ( code, title, starts_on )")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
        Training Applications
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
        Applications to scheduled training cohorts.
      </p>
      {(rows ?? []).length === 0 ? (
        <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          No applications yet.
        </p>
      ) : (
        <div className="space-y-3">
          {(rows ?? []).map((b) => {
            const c = b.cohort as { code?: string; title?: string; starts_on?: string } | null;
            return (
              <div key={b.id as string} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {b.full_name as string} ·{" "}
                      <a className="underline" style={{ color: "var(--accent)" }} href={`mailto:${b.email}`}>
                        {b.email as string}
                      </a>
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                      {(b.organisation as string) || "—"}
                      {b.phone ? ` · ${b.phone as string}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    {c?.code ? (
                      <span className="badge badge-cyan">{c.code} — {c.title}</span>
                    ) : (
                      <span className="badge badge-gray">no cohort</span>
                    )}
                    <div className="mt-1 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      {new Date(b.created_at as string).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>
                {b.prior_experience ? (
                  <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
                    <strong>Prior experience:</strong> {b.prior_experience as string}
                  </p>
                ) : null}
                {b.motivation ? (
                  <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
                    <strong>Motivation:</strong> {b.motivation as string}
                  </p>
                ) : null}
                {b.admin_notes ? (
                  <p className="mt-2 text-xs" style={{ color: "var(--orange)" }}>
                    <strong>Notes:</strong> {b.admin_notes as string}
                  </p>
                ) : null}
                <AdminRequestRow
                  id={b.id as string}
                  kind="application"
                  status={b.status as string}
                  statuses={STATUSES}
                  adminNotes={(b.admin_notes as string) || ""}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
