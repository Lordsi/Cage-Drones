import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { ArrowLeft, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { FlightChecklist } from "@/components/flight-checklist";
import {
  DEFAULT_PREFLIGHT,
  DEFAULT_POSTFLIGHT,
  normalizeChecklist,
} from "@/lib/flight-checklists";
import {
  updateFlightDetails,
  setFlightStatus,
  deleteFlight,
} from "@/app/actions/flights";

export default async function PortalFlightDetailPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase);
  if (!profile) redirect("/login");

  const { data: flight } = await supabase
    .from("flights")
    .select(
      "*, aircraft:aircraft_id ( id, registration, model ), course:course_id ( id, title )",
    )
    .eq("id", flightId)
    .maybeSingle();

  if (!flight) notFound();

  const isPilot = flight.pilot_id === user.id;
  const readOnly = !isPilot;

  const { data: aircraftList } = await supabase
    .from("aircraft")
    .select("id, registration, model")
    .eq("active", true)
    .order("registration");

  const { data: evaluation } = await supabase
    .from("flight_evaluations")
    .select(
      "*, instructor:instructor_id ( id, display_name )",
    )
    .eq("flight_id", flightId)
    .maybeSingle();

  const pre = normalizeChecklist(flight.preflight_checklist, DEFAULT_PREFLIGHT);
  const post = normalizeChecklist(flight.postflight_checklist, DEFAULT_POSTFLIGHT);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/portal/flights"
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {(flight.mission_type as string) || "Flight"} · {(flight.location as string) || "—"}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {flight.departure_at
              ? new Date(flight.departure_at as string).toLocaleString("en-GB")
              : "Unscheduled"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`badge ${
              flight.status === "completed"
                ? "badge-green"
                : flight.status === "in_progress"
                ? "badge-cyan"
                : flight.status === "cancelled"
                ? "badge-red"
                : "badge-gray"
            }`}
          >
            {flight.status as string}
          </span>
          {flight.review_status === "needs_attention" ? (
            <span className="badge badge-orange">
              <AlertTriangle size={10} /> needs attention
            </span>
          ) : flight.review_status === "approved" ? (
            <span className="badge badge-green">
              <CheckCircle2 size={10} /> approved
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>Mission details</h3>
            <form action={updateFlightDetails} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={flight.id as string} />
              <FieldText label="Mission type" name="mission_type" defaultValue={(flight.mission_type as string) ?? ""} readOnly={readOnly} />
              <FieldText label="Location" name="location" defaultValue={(flight.location as string) ?? ""} readOnly={readOnly} />
              <FieldSelect
                label="Aircraft"
                name="aircraft_id"
                defaultValue={(flight.aircraft_id as string) ?? ""}
                readOnly={readOnly}
                options={[{ value: "", label: "—" }].concat(
                  (aircraftList ?? []).map((a) => ({
                    value: a.id as string,
                    label: `${a.registration as string} — ${a.model as string}`,
                  })),
                )}
              />
              <FieldText
                label="Departure"
                name="departure_at"
                type="datetime-local"
                defaultValue={toLocalInput(flight.departure_at as string | null)}
                readOnly={readOnly}
              />
              <FieldText
                label="Arrival"
                name="arrival_at"
                type="datetime-local"
                defaultValue={toLocalInput(flight.arrival_at as string | null)}
                readOnly={readOnly}
              />
              <FieldText
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                defaultValue={
                  flight.duration_minutes != null ? String(flight.duration_minutes as number) : ""
                }
                readOnly={readOnly}
              />
              <FieldText label="Latitude" name="latitude" defaultValue={(flight.latitude as number | null)?.toString() ?? ""} readOnly={readOnly} />
              <FieldText label="Longitude" name="longitude" defaultValue={(flight.longitude as number | null)?.toString() ?? ""} readOnly={readOnly} />
              <FieldText label="Wind (kt)" name="wind_kts" type="number" defaultValue={(flight.wind_kts as number | null)?.toString() ?? ""} readOnly={readOnly} />
              <FieldText label="Visibility (km)" name="visibility_km" type="number" defaultValue={(flight.visibility_km as number | null)?.toString() ?? ""} readOnly={readOnly} />
              <div className="sm:col-span-2">
                <FieldTextArea label="Weather summary" name="weather_summary" defaultValue={(flight.weather_summary as string) ?? ""} readOnly={readOnly} />
              </div>
              <div className="sm:col-span-2">
                <FieldTextArea label="Pilot notes" name="pilot_notes" defaultValue={(flight.pilot_notes as string) ?? ""} readOnly={readOnly} />
              </div>
              {!readOnly && (
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="btn-primary px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
                    Save details
                  </button>
                </div>
              )}
            </form>
          </div>

          <FlightChecklist flightId={flight.id as string} which="preflight" items={pre} readOnly={readOnly} />
          <FlightChecklist flightId={flight.id as string} which="postflight" items={post} readOnly={readOnly} />
        </div>

        <div className="space-y-4">
          {!readOnly && (
            <div className="card p-5">
              <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>Status</h3>
              <div className="flex flex-wrap gap-2">
                {["planned", "in_progress", "completed", "cancelled"].map((s) => (
                  <form key={s} action={setFlightStatus}>
                    <input type="hidden" name="id" value={flight.id as string} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className="btn-ghost px-3 py-1.5 text-xs"
                      style={{ borderRadius: 4, opacity: flight.status === s ? 1 : 0.7 }}
                    >
                      {s}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>
              Instructor evaluation
            </h3>
            {!evaluation ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No instructor evaluation yet. Submit the post-flight checklist for review.
              </p>
            ) : (
              <div className="space-y-3 text-sm" style={{ color: "var(--text)" }}>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  Signed by{" "}
                  {(evaluation.instructor as { display_name?: string } | null)?.display_name ?? "instructor"}
                  {" · "}
                  {new Date(evaluation.signed_at as string).toLocaleDateString()}
                </div>
                <ScoreRow label="Pre-flight" value={evaluation.preflight_score as number | null} />
                <ScoreRow label="Airmanship" value={evaluation.airmanship_score as number | null} />
                <ScoreRow label="Procedures" value={evaluation.procedures_score as number | null} />
                <ScoreRow label="Decision making" value={evaluation.decision_making_score as number | null} />
                <ScoreRow label="Post-flight" value={evaluation.postflight_score as number | null} />
                {evaluation.overall_grade ? (
                  <div className="text-sm font-semibold">Overall: {evaluation.overall_grade as string}</div>
                ) : null}
                {evaluation.strengths ? <Quote title="Strengths" text={evaluation.strengths as string} /> : null}
                {evaluation.improvements ? <Quote title="Improvements" text={evaluation.improvements as string} /> : null}
                {evaluation.comments ? <Quote title="Comments" text={evaluation.comments as string} /> : null}
              </div>
            )}
          </div>

          {!readOnly && flight.status !== "completed" && (
            <form action={deleteFlight}>
              <input type="hidden" name="id" value={flight.id as string} />
              <button
                type="submit"
                className="btn-ghost w-full px-4 py-2 text-sm"
                style={{ borderRadius: 4, color: "var(--red)", borderColor: "color-mix(in srgb, var(--red) 30%, var(--border))" }}
              >
                <Trash2 size={14} /> Delete flight
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ScoreRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--text)" }}>{value != null ? `${value} / 5` : "—"}</span>
    </div>
  );
}

function Quote({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        {title}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "var(--muted2)" }}>
        {text}
      </p>
    </div>
  );
}

function FieldText({
  label,
  name,
  defaultValue,
  type = "text",
  readOnly,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={readOnly}
        className="rounded border px-3 py-2 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      />
    </label>
  );
}

function FieldTextArea({
  label,
  name,
  defaultValue,
  readOnly,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        disabled={readOnly}
        className="rounded border px-3 py-2 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      />
    </label>
  );
}

function FieldSelect({
  label,
  name,
  defaultValue,
  options,
  readOnly,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={readOnly}
        className="rounded border px-3 py-2 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
