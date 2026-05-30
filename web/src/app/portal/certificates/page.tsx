import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Award, ShieldCheck } from "lucide-react";

export default async function PortalCertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: certs } = await supabase
    .from("certificates")
    .select("*, course:course_id ( title )")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Certificates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Your awarded certifications. Anyone can verify a serial at{" "}
          <Link href="/verify" className="underline" style={{ color: "var(--accent)" }}>
            /verify
          </Link>
          .
        </p>
      </div>

      {(certs ?? []).length === 0 ? (
        <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          <Award size={28} className="mx-auto mb-2" />
          You have not been issued a certificate yet.
        </p>
      ) : (
        <div className="space-y-3">
          {(certs ?? []).map((c) => {
            const course = c.course as { title?: string } | null;
            return (
              <Link
                key={c.id as string}
                href={`/certificate/${c.serial as string}`}
                className="card flex items-center justify-between gap-4 p-5 transition-colors hover:border-[var(--accent)]"
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {course?.title ?? "Course"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {c.serial as string}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    Issued {new Date(c.issued_at as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {c.grade ? ` · ${c.grade as string}` : ""}
                  </div>
                </div>
                {c.revoked ? (
                  <span className="badge badge-red">revoked</span>
                ) : (
                  <span className="badge badge-green">
                    <ShieldCheck size={10} /> valid
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
