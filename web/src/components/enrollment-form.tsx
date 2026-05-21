"use client";

import { useState, useEffect, useTransition } from "react";
import { ArrowRight, CheckCircle, RotateCcw } from "lucide-react";
import { submitEnrollmentInquiry } from "@/app/actions/enrollment";

const SERVICE_OPTIONS: readonly { value: string; label: string; disabled?: boolean }[] = [
  { value: "", label: "Select a primary interest", disabled: true },
  { value: "pilot-certification", label: "Pilot Certification Training" },
  { value: "enterprise-fleet", label: "Enterprise Fleet Solutions" },
  { value: "surveillance-ops", label: "Surveillance & Inspection Ops" },
  { value: "specialized-mapping", label: "Specialized Mapping" },
  { value: "custom-integration", label: "Custom Payload Integration" },
  { value: "maintenance", label: "Maintenance & Fleet Support" },
];

const COURSE_TO_SERVICE: Record<string, string> = {
  repl: "pilot-certification",
  mapping: "specialized-mapping",
  inspection: "surveillance-ops",
};

export function EnrollmentForm() {
  const [serviceInterest, setServiceInterest] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash;
      if (hash.startsWith("#enroll-form")) {
        const params = new URLSearchParams(hash.split("?")[1] || "");
        const course = params.get("course");
        if (course && COURSE_TO_SERVICE[course]) {
          setServiceInterest(COURSE_TO_SERVICE[course]);
        }
      }
    }

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitEnrollmentInquiry(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
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
        <h3
          className="text-xl font-bold mb-3"
          style={{ color: "var(--text)" }}
        >
          Thank you for enrolling with CAGE
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--muted)", maxWidth: "28rem", lineHeight: 1.7 }}
        >
          Our team will review your application and contact you shortly. We look
          forward to welcoming you to our training programs.
        </p>
        <button
          className="landing-btn-primary flex items-center gap-2"
          onClick={() => {
            setSubmitted(false);
            setServiceInterest("");
            setError(null);
          }}
        >
          <RotateCcw size={14} /> Submit Another
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" action={handleSubmit}>
      <p className="landing-eyebrow">Initiate Mission Support</p>
      <h2 className="landing-h2">Ready to take flight?</h2>
      <p className="landing-body mb-6">
        Connect with our flight operations experts and certified instructors.
      </p>

      {error && (
        <div
          className="px-4 py-3 rounded text-sm font-medium"
          style={{
            background: "color-mix(in srgb, var(--red) 8%, transparent)",
            color: "var(--red)",
            border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Full Name
          </label>
          <input
            name="full_name"
            required
            className="w-full h-12 px-4 border rounded outline-none transition-all"
            style={{ borderColor: "var(--input-border)", background: "var(--surface)", color: "var(--text)" }}
            placeholder="John Doe"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Work Email
          </label>
          <input
            name="email"
            required
            className="w-full h-12 px-4 border rounded outline-none transition-all"
            style={{ borderColor: "var(--input-border)", background: "var(--surface)", color: "var(--text)" }}
            placeholder="j.doe@enterprise.com"
            type="email"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Company / Agency
          </label>
          <input
            name="company"
            className="w-full h-12 px-4 border rounded outline-none transition-all"
            style={{ borderColor: "var(--input-border)", background: "var(--surface)", color: "var(--text)" }}
            placeholder="Aerospace Dynamics"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Service Interest
          </label>
          <select
            name="service_interest"
            required
            className="w-full h-12 px-4 border rounded outline-none transition-all appearance-none"
            style={{ borderColor: "var(--input-border)", background: "var(--surface)", color: "var(--text)" }}
            value={serviceInterest}
            onChange={(e) => setServiceInterest(e.target.value)}
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          Inquiry Details
        </label>
        <textarea
          name="details"
          className="w-full px-4 py-3 border rounded outline-none transition-all resize-none"
          style={{ borderColor: "var(--input-border)", background: "var(--surface)", color: "var(--text)" }}
          placeholder="Please describe your mission requirements or training objectives..."
          rows={5}
        />
      </div>
      <button
        className="landing-btn-primary"
        type="submit"
        disabled={isPending}
        style={{ opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? "Submitting..." : "Transmit Inquiry"}{" "}
        <ArrowRight size={14} aria-hidden />
      </button>
    </form>
  );
}
