import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { Plane, Plus, Clock, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { createFlight } from "@/app/actions/flights";

type AircraftRow = { id: string; registration: string; model: string };

export default async function PortalFlightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase);
  if (!profile) redirect("/login");

  const [{ data: flights }, { data: aircraft }, { data: totals }] = await Promise.all([
    supabase
      .from("flights")
      .select(
        "id, mission_type, location, departure_at, duration_minutes, status, review_status, aircraft:aircraft_id ( registration, model )",
      )
      .eq("pilot_id", user.id)
      .order("departure_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("aircraft")
      .select("id, registration, model")
      .eq("active", true)
      .order("registration"),
    supabase
      .from("pilot_logbook_totals")
      .select("total_flights, total_minutes, completed_flights, last_flight_at")
      .eq("pilot_id", user.id)
      .maybeSingle(),
  ]);

  const totalMinutes = (totals?.total_minutes as number | undefined) ?? 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Pilot Logbook
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Plan flights, run pre/post checklists, and submit for instructor review.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Flights", value: String(totals?.total_flights ?? 0), icon: Plane, color: "var(--accent)" },
          { label: "Hours", value: totalHours, icon: Clock, color: "var(--blue)" },
          { label: "Completed", value: String(totals?.completed_flights ?? 0), icon: CheckCircle2, color: "var(--green)" },
          {
            label: "Last flight",
            value: totals?.last_flight_at
              ? new Date(totals.last_flight_at as string).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              : "—",
            icon: MapPin,
            color: "var(--orange)",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>
              <s.icon size={17} style={{ color: s.color }} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
            <div className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          New Flight
        </h2>
        <form action={createFlight} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            name="aircraft_id"
            className="rounded border px-3 py-2 text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
          >
            <option value="">Aircraft (optional)</option>
            {((aircraft as AircraftRow[] | null) ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.registration} — {a.model}
              </option>
            ))}
          </select>
          <input
            name="mission_type"
            placeholder="Mission (e.g. training, mapping)"
            className="rounded border px-3 py-2 text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
            defaultValue="training"
          />
          <input
            name="location"
            placeholder="Location"
            className="rounded border px-3 py-2 text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
          />
          <input
            name="departure_at"
            type="datetime-local"
            className="rounded border px-3 py-2 text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
          />
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button type="submit" className="btn-primary px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
              <Plus size={14} /> Start flight log
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {(flights ?? []).length === 0 ? (
          <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            No flights logged yet. Use the form above to start your first pre-flight checklist.
          </p>
        ) : (
          (flights ?? []).map((f) => {
            const ac = f.aircraft as { registration?: string; model?: string } | null;
            return (
              <Link
                key={f.id as string}
                href={`/portal/flights/${f.id as string}`}
                className="card flex items-center justify-between gap-4 p-4 transition-colors hover:border-[var(--accent)]"
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {(f.mission_type as string) || "Flight"} · {(f.location as string) || "—"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                    {f.departure_at
                      ? new Date(f.departure_at as string).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unscheduled"}
                    {ac?.registration ? ` · ${ac.registration}` : ""}
                    {f.duration_minutes ? ` · ${f.duration_minutes} min` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      f.status === "completed"
                        ? "badge-green"
                        : f.status === "in_progress"
                        ? "badge-cyan"
                        : f.status === "cancelled"
                        ? "badge-red"
                        : "badge-gray"
                    }`}
                  >
                    {f.status as string}
                  </span>
                  {f.review_status === "needs_attention" ? (
                    <span className="badge badge-orange">
                      <AlertTriangle size={10} /> needs attention
                    </span>
                  ) : f.review_status === "approved" ? (
                    <span className="badge badge-green">
                      <CheckCircle2 size={10} /> approved
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
