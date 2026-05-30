import type { SupabaseClient } from "@supabase/supabase-js";

type OutboxKind =
  | "service_booking"
  | "quotation_request"
  | "training_application"
  | "enrollment_inquiry"
  | "grade_posted"
  | "flight_review";

export type OutboxEntry = {
  to: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  html?: string | null;
  kind: OutboxKind;
  relatedId?: string | null;
};

/**
 * Best-effort write to the email_outbox table. Tolerates RLS rejecting the
 * write (e.g. when called from the public-facing form): in that case we just
 * log and return false so the caller can decide whether that is fatal.
 *
 * Actual delivery is expected to happen out-of-band: a Supabase scheduled
 * Edge Function or a small cron job can drain the outbox into Resend / SES /
 * SMTP. Optionally, if RESEND_API_KEY is set, we attempt delivery inline.
 */
export async function enqueueEmail(
  supabase: SupabaseClient,
  entry: OutboxEntry,
): Promise<boolean> {
  const adminEmail = process.env.CAGE_ADMIN_EMAIL || "info@cagemw.com";
  const to = entry.to === "admin" ? adminEmail : entry.to;

  type Status = "pending" | "sent" | "failed" | "skipped";
  let status: Status = "pending";
  let lastError: string | null = null;
  let sentAt: string | null = null;

  if (process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from:
            process.env.CAGE_EMAIL_FROM ||
            "CAGE <notifications@cagemw.com>",
          to: [to],
          reply_to: entry.replyTo || undefined,
          subject: entry.subject,
          text: entry.text,
          html: entry.html || undefined,
        }),
      });
      if (resp.ok) {
        status = "sent";
        sentAt = new Date().toISOString();
      } else {
        status = "failed";
        lastError = `Resend HTTP ${resp.status}`;
      }
    } catch (e) {
      status = "failed";
      lastError = (e as Error).message;
    }
  } else {
    status = "skipped";
    lastError = "RESEND_API_KEY not configured — queued only";
  }

  const { error } = await supabase.from("email_outbox").insert({
    to_address: to,
    reply_to: entry.replyTo || null,
    subject: entry.subject,
    body_text: entry.text,
    body_html: entry.html || null,
    related_kind: entry.kind,
    related_id: entry.relatedId || null,
    status,
    attempts: (status as Status) === "pending" || (status as Status) === "skipped" ? 0 : 1,
    last_error: lastError,
    sent_at: sentAt,
  });

  if (error) {
    console.warn(
      "[notifications] could not write to email_outbox (likely RLS):",
      error.message,
    );
    return false;
  }

  return true;
}
