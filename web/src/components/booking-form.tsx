"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle, RotateCcw } from "lucide-react";
import {
  submitServiceBooking,
  submitQuotationRequest,
  submitTrainingApplication,
} from "@/app/actions/bookings";

const SERVICE_OPTIONS = [
  "Specialized Mapping",
  "Surveillance & Inspection",
  "Precision Agriculture",
  "Thermal Inspection",
  "Photogrammetry / LiDAR",
  "Search & Rescue Support",
  "Other",
] as const;

type Tab = "booking" | "quotation" | "training";

type Cohort = {
  id: string;
  code: string;
  title: string;
  location: string;
  starts_on: string;
  status: string;
};

export function BookingForm({ cohorts }: { cohorts: Cohort[] }) {
  const [tab, setTab] = useState<Tab>("booking");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setSubmitted(false);
    setError(null);
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      let result: { success: boolean; error?: string };
      if (tab === "booking") result = await submitServiceBooking(formData);
      else if (tab === "quotation") result = await submitQuotationRequest(formData);
      else result = await submitTrainingApplication(formData);
      if (result.success) setSubmitted(true);
      else setError(result.error || "Something went wrong.");
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: "color-mix(in srgb, var(--green) 10%, transparent)" }}
        >
          <CheckCircle size={32} style={{ color: "var(--green)" }} />
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>
          {tab === "booking"
            ? "Booking received — we'll be in touch"
            : tab === "quotation"
            ? "Quotation request received"
            : "Application received"}
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--muted)", maxWidth: "28rem", lineHeight: 1.7 }}>
          The CAGE team has been notified and will respond shortly via email.
        </p>
        <button className="landing-btn-primary flex items-center gap-2" onClick={reset}>
          <RotateCcw size={14} /> Submit another
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="landing-eyebrow">Initiate Mission Support</p>
      <h2 className="landing-h2">How can we help?</h2>
      <div role="tablist" className="mb-6 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        {(
          [
            { id: "booking" as const, label: "Book a service" },
            { id: "quotation" as const, label: "Request quotation" },
            { id: "training" as const, label: "Apply for training" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="font-mono"
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: 6,
              background: tab === t.id ? "var(--accent)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--muted2)",
              border: `1px solid ${tab === t.id ? "var(--accent)" : "var(--border)"}`,
              cursor: "pointer",
              fontFamily: "var(--font-mono-stack)",
              fontSize: "var(--fs-2xs)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              minHeight: 44,
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="mb-4 rounded px-4 py-3 text-sm font-medium"
          style={{
            background: "color-mix(in srgb, var(--red) 8%, transparent)",
            color: "var(--red)",
            border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      <form action={onSubmit} className="space-y-4">
        {tab === "booking" && (
          <>
            <Row>
              <Field name="contact_name" label="Full Name" required />
              <Field name="contact_email" label="Email" type="email" required />
            </Row>
            <Row>
              <Field name="contact_phone" label="Phone" />
              <Field name="organisation" label="Organisation" />
            </Row>
            <Row>
              <Select name="service_type" label="Service" required options={SERVICE_OPTIONS.map((s) => ({ value: s, label: s }))} />
              <Field name="site_location" label="Site location" />
            </Row>
            <Row>
              <Field name="preferred_date" label="Preferred date" type="date" />
              <Field name="alt_date" label="Alternate date" type="date" />
            </Row>
            <Row>
              <Field name="area_hectares" label="Area (ha)" type="number" />
              <div />
            </Row>
            <Area name="description" label="Project details" />
          </>
        )}

        {tab === "quotation" && (
          <>
            <Row>
              <Field name="contact_name" label="Full Name" required />
              <Field name="contact_email" label="Email" type="email" required />
            </Row>
            <Row>
              <Field name="contact_phone" label="Phone" />
              <Field name="organisation" label="Organisation" />
            </Row>
            <Area name="project_scope" label="Project scope" required />
            <Area name="required_deliverables" label="Required deliverables" />
            <Row>
              <Field name="expected_timeline" label="Expected timeline" />
              <Field name="budget_range" label="Budget range" />
            </Row>
          </>
        )}

        {tab === "training" && (
          <>
            <Row>
              <Field name="full_name" label="Full Name" required />
              <Field name="email" label="Email" type="email" required />
            </Row>
            <Row>
              <Field name="phone" label="Phone" />
              <Field name="organisation" label="Organisation" />
            </Row>
            <Select
              name="cohort_id"
              label="Cohort"
              options={[{ value: "", label: "Any upcoming cohort" }].concat(
                cohorts.map((c) => ({
                  value: c.id,
                  label: `${c.code} — ${c.title} · ${new Date(c.starts_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
                })),
              )}
            />
            <Area name="prior_experience" label="Prior experience" />
            <Area name="motivation" label="Motivation" />
          </>
        )}

        <button
          className="landing-btn-primary"
          type="submit"
          disabled={isPending}
          style={{ opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? "Submitting…" : "Submit"} <ArrowRight size={14} aria-hidden />
        </button>
      </form>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-label">
        {label} {required ? "*" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="cage-input"
        style={{ minHeight: 44, fontSize: "var(--fs-base)" }}
      />
    </label>
  );
}

function Area({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-label">
        {label} {required ? "*" : ""}
      </span>
      <textarea
        name={name}
        required={required}
        rows={4}
        className="cage-input resize-none"
        style={{ fontSize: "var(--fs-base)" }}
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-label">
        {label} {required ? "*" : ""}
      </span>
      <select
        name={name}
        required={required}
        className="cage-input appearance-none"
        style={{ minHeight: 44, fontSize: "var(--fs-base)" }}
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
