"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enqueueEmail } from "@/lib/notifications";

function asStr(formData: FormData, k: string): string {
  return String(formData.get(k) ?? "").trim();
}
function asStrOrNull(formData: FormData, k: string): string | null {
  const v = asStr(formData, k);
  return v === "" ? null : v;
}
function asDateOrNull(formData: FormData, k: string): string | null {
  const v = asStr(formData, k);
  return v === "" ? null : v;
}

// ---------------- Service bookings ----------------

export async function submitServiceBooking(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const contact_name = asStr(formData, "contact_name");
  const contact_email = asStr(formData, "contact_email");
  const service_type = asStr(formData, "service_type");
  if (!contact_name || !contact_email || !service_type) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const payload = {
    contact_name,
    contact_email,
    contact_phone: asStrOrNull(formData, "contact_phone"),
    organisation: asStrOrNull(formData, "organisation"),
    service_type,
    site_location: asStrOrNull(formData, "site_location"),
    preferred_date: asDateOrNull(formData, "preferred_date"),
    alt_date: asDateOrNull(formData, "alt_date"),
    area_hectares: (() => {
      const v = asStr(formData, "area_hectares");
      return v ? Number(v) : null;
    })(),
    description: asStrOrNull(formData, "description"),
  };

  const { data, error } = await supabase
    .from("service_bookings")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    console.error("[booking] insert error:", error);
    return { success: false, error: "Failed to submit booking. Please try again." };
  }

  await enqueueEmail(supabase, {
    to: "admin",
    replyTo: contact_email,
    subject: `New service booking — ${service_type}`,
    text: [
      `New service booking submitted on cagemw.com`,
      ``,
      `Contact: ${contact_name} <${contact_email}>`,
      payload.contact_phone ? `Phone: ${payload.contact_phone}` : null,
      payload.organisation ? `Organisation: ${payload.organisation}` : null,
      `Service: ${service_type}`,
      payload.site_location ? `Site: ${payload.site_location}` : null,
      payload.preferred_date ? `Preferred date: ${payload.preferred_date}` : null,
      payload.alt_date ? `Alternate date: ${payload.alt_date}` : null,
      payload.area_hectares ? `Area: ${payload.area_hectares} ha` : null,
      payload.description ? `\nDetails:\n${payload.description}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    kind: "service_booking",
    relatedId: data.id as string,
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}

// ---------------- Quotation requests ----------------

export async function submitQuotationRequest(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const contact_name = asStr(formData, "contact_name");
  const contact_email = asStr(formData, "contact_email");
  const project_scope = asStr(formData, "project_scope");
  if (!contact_name || !contact_email || !project_scope) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const payload = {
    contact_name,
    contact_email,
    contact_phone: asStrOrNull(formData, "contact_phone"),
    organisation: asStrOrNull(formData, "organisation"),
    project_scope,
    required_deliverables: asStrOrNull(formData, "required_deliverables"),
    expected_timeline: asStrOrNull(formData, "expected_timeline"),
    budget_range: asStrOrNull(formData, "budget_range"),
  };

  const { data, error } = await supabase
    .from("quotation_requests")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    console.error("[quotation] insert error:", error);
    return { success: false, error: "Failed to submit quotation request." };
  }

  await enqueueEmail(supabase, {
    to: "admin",
    replyTo: contact_email,
    subject: `New quotation request from ${contact_name}`,
    text: [
      `New quotation request:`,
      ``,
      `Contact: ${contact_name} <${contact_email}>`,
      payload.contact_phone ? `Phone: ${payload.contact_phone}` : null,
      payload.organisation ? `Organisation: ${payload.organisation}` : null,
      `\nScope:\n${project_scope}`,
      payload.required_deliverables ? `\nDeliverables:\n${payload.required_deliverables}` : null,
      payload.expected_timeline ? `Timeline: ${payload.expected_timeline}` : null,
      payload.budget_range ? `Budget: ${payload.budget_range}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    kind: "quotation_request",
    relatedId: data.id as string,
  });

  revalidatePath("/admin/quotations");
  return { success: true };
}

// ---------------- Training applications ----------------

export async function submitTrainingApplication(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const full_name = asStr(formData, "full_name");
  const email = asStr(formData, "email");
  const cohort_id = asStr(formData, "cohort_id") || null;
  if (!full_name || !email) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    cohort_id,
    applicant_user_id: user?.id ?? null,
    full_name,
    email,
    phone: asStrOrNull(formData, "phone"),
    organisation: asStrOrNull(formData, "organisation"),
    prior_experience: asStrOrNull(formData, "prior_experience"),
    motivation: asStrOrNull(formData, "motivation"),
  };

  const { data, error } = await supabase
    .from("training_applications")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    console.error("[training application] insert error:", error);
    return { success: false, error: "Failed to submit training application." };
  }

  await enqueueEmail(supabase, {
    to: "admin",
    replyTo: email,
    subject: `Training application — ${full_name}`,
    text: [
      `New training application:`,
      ``,
      `Applicant: ${full_name} <${email}>`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      payload.organisation ? `Organisation: ${payload.organisation}` : null,
      cohort_id ? `Cohort: ${cohort_id}` : null,
      payload.prior_experience ? `\nPrior experience:\n${payload.prior_experience}` : null,
      payload.motivation ? `\nMotivation:\n${payload.motivation}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    kind: "training_application",
    relatedId: data.id as string,
  });

  revalidatePath("/admin/applications");
  return { success: true };
}

// ---------------- Admin status updates ----------------

export async function updateBookingStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim();
  if (!id || !status || !kind) throw new Error("Missing fields");
  const supabase = await createClient();
  const table =
    kind === "booking"
      ? "service_bookings"
      : kind === "quotation"
      ? "quotation_requests"
      : kind === "application"
      ? "training_applications"
      : null;
  if (!table) throw new Error("Unknown kind");
  const patch: Record<string, unknown> = { status };
  if (notes) patch.admin_notes = notes;
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/applications");
}

// ---------------- Cohorts ----------------

export async function createCohort(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const code = String(formData.get("code") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const starts_on = String(formData.get("starts_on") ?? "").trim();
  const ends_on = String(formData.get("ends_on") ?? "").trim() || null;
  const capacity = Number(formData.get("capacity") ?? 12);
  const status = String(formData.get("status") ?? "open");
  const course_id = String(formData.get("course_id") ?? "").trim() || null;
  const price_display = String(formData.get("price_display") ?? "").trim() || null;

  if (!code || !title || !starts_on) throw new Error("Missing required cohort fields");

  const { error } = await supabase.from("training_cohorts").insert({
    code,
    title,
    location,
    starts_on,
    ends_on,
    capacity,
    status,
    course_id,
    price_display,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/cohorts");
  revalidatePath("/");
}

export async function updateCohortStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) throw new Error("Missing fields");
  const { error } = await supabase
    .from("training_cohorts")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/cohorts");
  revalidatePath("/");
}
