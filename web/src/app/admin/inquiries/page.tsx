import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Mail } from "lucide-react";
import { InquiryActions } from "./inquiry-actions";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();

  const { data: inquiries, error } = await supabase
    .from("enrollment_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin"
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Enrollment Inquiries
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Review and manage enrollment applications
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg p-4 text-sm font-medium"
          style={{
            background: "color-mix(in srgb, var(--red) 8%, transparent)",
            color: "var(--red)",
            border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)",
          }}
        >
          Failed to load inquiries. Please check the database table exists.
        </div>
      )}

      {!inquiries || inquiries.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <Mail size={40} style={{ color: "var(--muted)" }} strokeWidth={1} />
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--muted)" }}>
            No enrollment inquiries yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    {(inq.full_name as string).slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {inq.full_name}
                    </div>
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-xs"
                      style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                    >
                      {inq.email}
                    </a>
                    {inq.company && (
                      <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                        {inq.company}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${
                      inq.status === "pending"
                        ? "badge-orange"
                        : inq.status === "contacted"
                        ? "badge-cyan"
                        : inq.status === "admitted"
                        ? "badge-green"
                        : "badge-red"
                    }`}
                  >
                    {inq.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {new Date(inq.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-4">
                <div className="w-10 shrink-0" />
                <div className="flex-1">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    Service Interest
                  </div>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {formatServiceInterest(inq.service_interest as string)}
                  </div>

                  {inq.details && (
                    <>
                      <div className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                        Details
                      </div>
                      <p className="text-sm" style={{ color: "var(--muted2)" }}>
                        {inq.details}
                      </p>
                    </>
                  )}

                  {inq.admin_notes && (
                    <>
                      <div className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
                        Admin Notes
                      </div>
                      <p className="text-sm" style={{ color: "var(--muted2)" }}>
                        {inq.admin_notes}
                      </p>
                    </>
                  )}

                  <InquiryActions
                    id={inq.id as string}
                    email={inq.email as string}
                    status={inq.status as string}
                    adminNotes={(inq.admin_notes as string) || ""}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatServiceInterest(value: string): string {
  const map: Record<string, string> = {
    "pilot-certification": "Pilot Certification Training",
    "enterprise-fleet": "Enterprise Fleet Solutions",
    "surveillance-ops": "Surveillance & Inspection Ops",
    "specialized-mapping": "Specialized Mapping",
    "custom-integration": "Custom Payload Integration",
    "maintenance": "Maintenance & Fleet Support",
  };
  return map[value] || value;
}
