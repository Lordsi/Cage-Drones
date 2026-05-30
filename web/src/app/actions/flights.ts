"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isStaff } from "@/lib/profile";
import {
  DEFAULT_PREFLIGHT,
  DEFAULT_POSTFLIGHT,
  type ChecklistItem,
} from "@/lib/flight-checklists";

async function requireUser() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile) throw new Error("Not authenticated");
  return { supabase, profile };
}

async function requireStaff() {
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Forbidden");
  return { supabase, profile };
}

// ---------------- Aircraft ----------------

export async function createAircraft(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const registration = String(formData.get("registration") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const manufacturer = String(formData.get("manufacturer") ?? "").trim() || null;
  const serial = String(formData.get("serial_number") ?? "").trim() || null;
  const mtowRaw = String(formData.get("max_takeoff_weight_kg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!registration || !model) throw new Error("Registration and model required");
  const { error } = await supabase.from("aircraft").insert({
    registration,
    model,
    manufacturer,
    serial_number: serial,
    max_takeoff_weight_kg: mtowRaw ? Number(mtowRaw) : null,
    notes,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/aircraft");
  revalidatePath("/portal/flights");
}

export async function toggleAircraftActive(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Missing id");
  const { error } = await supabase.from("aircraft").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/aircraft");
}

// ---------------- Flights (pilot) ----------------

export async function createFlight(formData: FormData) {
  const { supabase, profile } = await requireUser();
  const aircraftId = String(formData.get("aircraft_id") ?? "") || null;
  const courseId = String(formData.get("course_id") ?? "") || null;
  const missionType = String(formData.get("mission_type") ?? "training").trim();
  const location = String(formData.get("location") ?? "").trim();
  const departureAt = String(formData.get("departure_at") ?? "").trim();
  const weatherSummary = String(formData.get("weather_summary") ?? "").trim();

  const { data, error } = await supabase
    .from("flights")
    .insert({
      pilot_id: profile.id,
      aircraft_id: aircraftId,
      course_id: courseId,
      mission_type: missionType,
      location,
      departure_at: departureAt ? new Date(departureAt).toISOString() : null,
      weather_summary: weatherSummary,
      preflight_checklist: DEFAULT_PREFLIGHT,
      postflight_checklist: DEFAULT_POSTFLIGHT,
      status: "planned",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/portal/flights");
  redirect(`/portal/flights/${data.id as string}`);
}

export async function updateFlightDetails(formData: FormData) {
  const { supabase, profile } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing flight id");

  const patch: Record<string, unknown> = {};
  const fields: Array<[string, "text" | "num" | "datetime"]> = [
    ["mission_type", "text"],
    ["location", "text"],
    ["weather_summary", "text"],
    ["pilot_notes", "text"],
    ["departure_at", "datetime"],
    ["arrival_at", "datetime"],
    ["duration_minutes", "num"],
    ["latitude", "num"],
    ["longitude", "num"],
    ["wind_kts", "num"],
    ["visibility_km", "num"],
  ];
  for (const [k, t] of fields) {
    const raw = formData.get(k);
    if (raw === null) continue;
    const s = String(raw).trim();
    if (t === "text") patch[k] = s;
    else if (t === "num") patch[k] = s === "" ? null : Number(s);
    else if (t === "datetime") patch[k] = s === "" ? null : new Date(s).toISOString();
  }
  const aircraftId = formData.get("aircraft_id");
  if (aircraftId !== null) patch.aircraft_id = String(aircraftId) || null;

  // Staff can update any flight; pilots restricted to their own (RLS enforces this).
  void profile;
  const { error } = await supabase.from("flights").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/flights/${id}`);
  revalidatePath(`/teacher/flights/${id}`);
}

export async function saveChecklist(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const which = String(formData.get("which") ?? "");
  if (!id || (which !== "preflight" && which !== "postflight")) {
    throw new Error("Bad request");
  }

  // Parse all `item_<idx>` / `ok_<idx>` / `notes_<idx>` fields
  const items: ChecklistItem[] = [];
  const indices = new Set<number>();
  for (const [k] of formData.entries()) {
    const m = /^(item|ok|notes)_(\d+)$/.exec(k);
    if (m) indices.add(Number(m[2]));
  }
  for (const i of Array.from(indices).sort((a, b) => a - b)) {
    const item = String(formData.get(`item_${i}`) ?? "").trim();
    if (!item) continue;
    const ok = formData.get(`ok_${i}`) === "on" || formData.get(`ok_${i}`) === "true";
    const notes = String(formData.get(`notes_${i}`) ?? "").trim();
    items.push({ item, ok, notes: notes || undefined });
  }

  const column =
    which === "preflight" ? "preflight_checklist" : "postflight_checklist";
  const tsColumn =
    which === "preflight" ? "preflight_completed_at" : "postflight_completed_at";
  const allOk = items.length > 0 && items.every((i) => i.ok);

  const patch: Record<string, unknown> = {
    [column]: items,
    [tsColumn]: allOk ? new Date().toISOString() : null,
  };
  if (which === "preflight" && allOk) {
    patch.status = "in_progress";
  } else if (which === "postflight" && allOk) {
    patch.status = "completed";
  }

  const { error } = await supabase.from("flights").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/flights/${id}`);
  revalidatePath(`/teacher/flights/${id}`);
}

export async function setFlightStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) throw new Error("Missing fields");
  const { error } = await supabase
    .from("flights")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/flights/${id}`);
  revalidatePath(`/teacher/flights/${id}`);
}

export async function deleteFlight(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  const { error } = await supabase.from("flights").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/flights");
  revalidatePath("/teacher/flights");
  redirect("/portal/flights");
}

// ---------------- Instructor evaluation ----------------

export async function submitEvaluation(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const flightId = String(formData.get("flight_id") ?? "");
  if (!flightId) throw new Error("Missing flight id");

  const num = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    if (!v) return null;
    const n = Number(v);
    if (Number.isNaN(n) || n < 1 || n > 5) return null;
    return n;
  };

  const overall = String(formData.get("overall_grade") ?? "").trim();
  const review = String(formData.get("review_status") ?? "approved");

  const { error } = await supabase
    .from("flight_evaluations")
    .upsert(
      {
        flight_id: flightId,
        instructor_id: profile.id,
        preflight_score: num("preflight_score"),
        airmanship_score: num("airmanship_score"),
        procedures_score: num("procedures_score"),
        decision_making_score: num("decision_making_score"),
        postflight_score: num("postflight_score"),
        overall_grade: overall || null,
        strengths: String(formData.get("strengths") ?? "").trim(),
        improvements: String(formData.get("improvements") ?? "").trim(),
        comments: String(formData.get("comments") ?? "").trim(),
      },
      { onConflict: "flight_id,instructor_id" },
    );
  if (error) throw new Error(error.message);

  await supabase
    .from("flights")
    .update({
      review_status:
        review === "needs_attention" ? "needs_attention" : "approved",
    })
    .eq("id", flightId);

  revalidatePath(`/teacher/flights/${flightId}`);
  revalidatePath(`/portal/flights/${flightId}`);
}
