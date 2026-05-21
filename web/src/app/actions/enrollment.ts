"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitEnrollmentInquiry(formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const company = (formData.get("company") as string) || null;
  const service_interest = formData.get("service_interest") as string;
  const details = (formData.get("details") as string) || null;

  if (!full_name || !email || !service_interest) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("enrollment_inquiries").insert({
    full_name,
    email,
    company,
    service_interest,
    details,
  });

  if (error) {
    console.error("Enrollment insert error:", error);
    return { success: false, error: "Failed to submit inquiry. Please try again." };
  }

  return { success: true };
}
