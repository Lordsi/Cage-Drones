import { createClient } from "@/lib/supabase/server";
import { AdminRequestRow } from "@/components/admin-request-row";

const STATUSES = ["pending", "quoted", "accepted", "declined", "expired"];

export default async function AdminQuotationsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("quotation_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
        Quotation Requests
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
        Quotation requests submitted from the public site.
      </p>
      {(rows ?? []).length === 0 ? (
        <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          No quotation requests yet.
        </p>
      ) : (
        <div className="space-y-3">
          {(rows ?? []).map((b) => (
            <div key={b.id as string} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {b.contact_name as string} ·{" "}
                    <a className="underline" style={{ color: "var(--accent)" }} href={`mailto:${b.contact_email}`}>
                      {b.contact_email as string}
                    </a>
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                    {(b.organisation as string) || "—"}
                    {b.contact_phone ? ` · ${b.contact_phone as string}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge badge-cyan">{b.status as string}</span>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {new Date(b.created_at as string).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--text)" }}>
                <strong>Scope:</strong> {b.project_scope as string}
              </p>
              <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3" style={{ color: "var(--muted2)" }}>
                {b.required_deliverables ? <div><strong>Deliverables:</strong> {b.required_deliverables as string}</div> : null}
                {b.expected_timeline ? <div><strong>Timeline:</strong> {b.expected_timeline as string}</div> : null}
                {b.budget_range ? <div><strong>Budget:</strong> {b.budget_range as string}</div> : null}
              </div>
              {b.admin_notes ? (
                <p className="mt-2 text-xs" style={{ color: "var(--orange)" }}>
                  <strong>Notes:</strong> {b.admin_notes as string}
                </p>
              ) : null}
              <AdminRequestRow
                id={b.id as string}
                kind="quotation"
                status={b.status as string}
                statuses={STATUSES}
                adminNotes={(b.admin_notes as string) || ""}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
