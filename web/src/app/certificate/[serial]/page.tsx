import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, ShieldX, Award } from "lucide-react";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const supabase = await createClient();
  const { data: rawData } = await supabase
    .rpc("rpc_verify_certificate", { p_serial: serial })
    .maybeSingle();

  const data = rawData as
    | {
        serial: string;
        issued_at: string;
        revoked: boolean;
        student_name: string;
        course_title: string;
        grade: string | null;
      }
    | null;

  if (!data) notFound();

  const issued = new Date(data.issued_at);

  return (
    <div className="min-h-screen" style={{ background: "var(--deep)" }}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← CAGE
        </Link>

        <div
          className="mt-6 overflow-hidden rounded-xl border bg-[var(--surface)] p-10"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
              >
                <Award size={26} color="var(--accent)" />
              </div>
              <div>
                <div className="text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Certificate of Completion
                </div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                  CAGE Drone Academy
                </h1>
              </div>
            </div>
            {data.revoked ? (
              <span className="badge badge-red">
                <ShieldX size={12} /> Revoked
              </span>
            ) : (
              <span className="badge badge-green">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
          </div>

          <p className="text-base" style={{ color: "var(--muted)" }}>
            This certifies that
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {data.student_name}
          </p>
          <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
            has successfully completed the program
          </p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--accent)" }}>
            {data.course_title}
          </p>
          {data.grade ? (
            <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
              Grade: <strong>{data.grade}</strong>
            </p>
          ) : null}

          <div className="mt-10 grid grid-cols-2 gap-6 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Certificate serial
              </div>
              <div className="mt-1 font-mono text-sm" style={{ color: "var(--text)" }}>
                {data.serial}
              </div>
            </div>
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Issued on
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--text)" }}>
                {issued.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
