import { createClient } from "@/lib/supabase/server";
import { AdminRequestRow } from "@/components/admin-request-row";

const STATUSES = ["pending", "contacted", "confirmed", "completed", "declined"];

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("service_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
        Service Bookings
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
        Date-specific service requests submitted from the public site.
      </p>
      {(bookings ?? []).length === 0 ? (
        <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          No service bookings yet.
        </p>
      ) : (
        <div className="space-y-3">
          {(bookings ?? []).map((b) => (
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
                  <span className="badge badge-cyan">{b.service_type as string}</span>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {new Date(b.created_at as string).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3" style={{ color: "var(--muted2)" }}>
                {b.site_location ? <div><strong>Site:</strong> {b.site_location as string}</div> : null}
                {b.preferred_date ? <div><strong>Preferred:</strong> {b.preferred_date as string}</div> : null}
                {b.alt_date ? <div><strong>Alt:</strong> {b.alt_date as string}</div> : null}
                {b.area_hectares ? <div><strong>Area:</strong> {b.area_hectares as number} ha</div> : null}
              </div>
              {b.description ? (
                <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
                  {b.description as string}
                </p>
              ) : null}
              {b.admin_notes ? (
                <p className="mt-2 text-xs" style={{ color: "var(--orange)" }}>
                  <strong>Notes:</strong> {b.admin_notes as string}
                </p>
              ) : null}
              <AdminRequestRow
                id={b.id as string}
                kind="booking"
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
