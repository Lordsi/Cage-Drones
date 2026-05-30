import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { FlightChecklist } from "@/components/flight-checklist";
import {
  DEFAULT_PREFLIGHT,
  DEFAULT_POSTFLIGHT,
  normalizeChecklist,
} from "@/lib/flight-checklists";
import { submitEvaluation } from "@/app/actions/flights";

export default async function TeacherFlightDetailPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  const supabase = await createClient();

  const { data: flight } = await supabase
    .from("flights")
    .select(
      "*, aircraft:aircraft_id ( registration, model ), pilot:pilot_id ( id, display_name )",
    )
    .eq("id", flightId)
    .maybeSingle();

  if (!flight) notFound();

  const { data: evaluation } = await supabase
    .from("flight_evaluations")
    .select("*")
    .eq("flight_id", flightId)
    .maybeSingle();

  const pre = normalizeChecklist(flight.preflight_checklist, DEFAULT_PREFLIGHT);
  const post = normalizeChecklist(flight.postflight_checklist, DEFAULT_POSTFLIGHT);

  const pilot = flight.pilot as { display_name?: string } | null;
  const ac = flight.aircraft as { registration?: string; model?: string } | null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/teacher/flights"
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
            Pilot {pilot?.display_name ?? "—"}
            {ac?.registration ? ` · ${ac.registration} (${ac.model})` : ""}
            {flight.departure_at ? ` · ${new Date(flight.departure_at as string).toLocaleString("en-GB")}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <FlightChecklist flightId={flight.id as string} which="preflight" items={pre} readOnly />
          <FlightChecklist flightId={flight.id as string} which="postflight" items={post} readOnly />

          {flight.pilot_notes ? (
            <div className="card p-5">
              <div className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Pilot notes
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "var(--text)" }}>
                {flight.pilot_notes as string}
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <div className="card p-5">
            <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>
              {evaluation ? "Update evaluation" : "Instructor evaluation"}
            </h3>
            <form action={submitEvaluation} className="space-y-3">
              <input type="hidden" name="flight_id" value={flight.id as string} />
              <ScoreField name="preflight_score" label="Pre-flight" defaultValue={evaluation?.preflight_score as number | null} />
              <ScoreField name="airmanship_score" label="Airmanship" defaultValue={evaluation?.airmanship_score as number | null} />
              <ScoreField name="procedures_score" label="Procedures" defaultValue={evaluation?.procedures_score as number | null} />
              <ScoreField name="decision_making_score" label="Decision making" defaultValue={evaluation?.decision_making_score as number | null} />
              <ScoreField name="postflight_score" label="Post-flight" defaultValue={evaluation?.postflight_score as number | null} />

              <label className="block">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Overall grade
                </span>
                <input
                  name="overall_grade"
                  defaultValue={(evaluation?.overall_grade as string) ?? ""}
                  placeholder="Pass / Pass with notes / Re-fly"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
                />
              </label>

              <TextField name="strengths" label="Strengths" defaultValue={(evaluation?.strengths as string) ?? ""} />
              <TextField name="improvements" label="Improvements" defaultValue={(evaluation?.improvements as string) ?? ""} />
              <TextField name="comments" label="Comments" defaultValue={(evaluation?.comments as string) ?? ""} />

              <label className="block">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Review status
                </span>
                <select
                  name="review_status"
                  defaultValue="approved"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
                >
                  <option value="approved">Approve</option>
                  <option value="needs_attention">Needs attention</option>
                </select>
              </label>

              <button type="submit" className="btn-primary w-full px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
                {evaluation ? "Update evaluation" : "Sign off evaluation"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number | null | undefined;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm" style={{ color: "var(--text)" }}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue != null ? String(defaultValue) : ""}
        className="w-24 rounded border px-2 py-1 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      >
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        {label}
      </span>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      />
    </label>
  );
}
