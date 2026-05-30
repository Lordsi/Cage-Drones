import { createClient } from "@/lib/supabase/server";
import { createAircraft, toggleAircraftActive } from "@/app/actions/flights";
import { Plane } from "lucide-react";

export default async function TeacherAircraftPage() {
  const supabase = await createClient();
  const { data: aircraft } = await supabase
    .from("aircraft")
    .select("*")
    .order("registration");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Aircraft Register
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Maintain the fleet inventory used in pilot logbooks.
        </p>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Add aircraft
        </h2>
        <form action={createAircraft} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="registration" required placeholder="Registration (e.g. CAGE-001)" className="cage-input" />
          <input name="model" required placeholder="Model (e.g. DJI Matrice 300)" className="cage-input" />
          <input name="manufacturer" placeholder="Manufacturer (e.g. DJI)" className="cage-input" />
          <input name="serial_number" placeholder="Serial number" className="cage-input" />
          <input name="max_takeoff_weight_kg" type="number" step="0.01" placeholder="MTOW (kg)" className="cage-input" />
          <input name="notes" placeholder="Notes" className="cage-input" />
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
              Register aircraft
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {(aircraft ?? []).length === 0 ? (
          <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            <Plane size={28} className="mx-auto mb-2" />
            No aircraft registered yet.
          </p>
        ) : (
          (aircraft ?? []).map((a) => (
            <div key={a.id as string} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {a.registration as string} · {a.model as string}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {(a.manufacturer as string) || "—"}
                  {a.serial_number ? ` · S/N ${a.serial_number as string}` : ""}
                  {a.max_takeoff_weight_kg ? ` · MTOW ${a.max_takeoff_weight_kg as number} kg` : ""}
                </div>
                {a.notes ? (
                  <p className="mt-1 text-xs" style={{ color: "var(--muted2)" }}>{a.notes as string}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${a.active ? "badge-green" : "badge-gray"}`}>
                  {a.active ? "active" : "retired"}
                </span>
                <form action={toggleAircraftActive}>
                  <input type="hidden" name="id" value={a.id as string} />
                  <input type="hidden" name="active" value={a.active ? "false" : "true"} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs" style={{ borderRadius: 4 }}>
                    {a.active ? "Retire" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

