"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollment_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update inquiry status:", error);
    return { success: false };
  }
  return { success: true };
}

export async function updateInquiryNotes(id: string, admin_notes: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollment_inquiries")
    .update({ admin_notes })
    .eq("id", id);

  if (error) {
    console.error("Failed to update inquiry notes:", error);
    return { success: false };
  }
  return { success: true };
}
