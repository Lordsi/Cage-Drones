"use server";

import { createClient } from "@/lib/supabase/server";

export async function markResourceViewed(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const resource_id = String(formData.get("resource_id") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!resource_id) return;

  await supabase.from("resource_views").upsert(
    {
      user_id: user.id,
      resource_id,
      viewed_at: new Date().toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,resource_id" },
  );
}
