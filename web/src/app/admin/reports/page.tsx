import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [
    { count: students },
    { count: instructors },
    { count: admins },
    { count: courses },
    { count: enrollments },
    { count: attempts },
    { count: submissions },
    { count: gradedSubs },
    { count: flights },
    { count: completedFlights },
    { count: aircraft },
    { count: certs },
    { count: bookings },
    { count: quotations },
    { count: applications },
    { count: inquiries },
    { data: scoreRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "instructor"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase.from("exam_attempts").select("id", { count: "exact", head: true }),
    supabase.from("assignment_submissions").select("id", { count: "exact", head: true }),
    supabase.from("assignment_submissions").select("id", { count: "exact", head: true }).eq("status", "graded"),
    supabase.from("flights").select("id", { count: "exact", head: true }),
    supabase.from("flights").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("aircraft").select("id", { count: "exact", head: true }),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
    supabase.from("service_bookings").select("id", { count: "exact", head: true }),
    supabase.from("quotation_requests").select("id", { count: "exact", head: true }),
    supabase.from("training_applications").select("id", { count: "exact", head: true }),
    supabase.from("enrollment_inquiries").select("id", { count: "exact", head: true }),
    supabase.from("exam_attempts").select("score_percent").not("score_percent", "is", null),
  ]);

  const scores = (scoreRows ?? []).map((r) => r.score_percent as number);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const passRate = scores.length
    ? Math.round((scores.filter((s) => s >= 70).length / scores.length) * 100)
    : null;

  const sections: Array<{ title: string; metrics: Array<{ label: string; value: string | number }> }> = [
    {
      title: "Users",
      metrics: [
        { label: "Students", value: students ?? 0 },
        { label: "Instructors", value: instructors ?? 0 },
        { label: "Admins", value: admins ?? 0 },
      ],
    },
    {
      title: "Academic",
      metrics: [
        { label: "Courses", value: courses ?? 0 },
        { label: "Enrollments", value: enrollments ?? 0 },
        { label: "Exam attempts", value: attempts ?? 0 },
        { label: "Avg exam score", value: avgScore != null ? `${avgScore}%` : "—" },
        { label: "Pass rate (≥70)", value: passRate != null ? `${passRate}%` : "—" },
        { label: "Assignments submitted", value: submissions ?? 0 },
        { label: "Assignments graded", value: gradedSubs ?? 0 },
        { label: "Certificates issued", value: certs ?? 0 },
      ],
    },
    {
      title: "Flight operations",
      metrics: [
        { label: "Aircraft", value: aircraft ?? 0 },
        { label: "Flights logged", value: flights ?? 0 },
        { label: "Flights completed", value: completedFlights ?? 0 },
      ],
    },
    {
      title: "Sales pipeline",
      metrics: [
        { label: "Inquiries", value: inquiries ?? 0 },
        { label: "Service bookings", value: bookings ?? 0 },
        { label: "Quotation requests", value: quotations ?? 0 },
        { label: "Training applications", value: applications ?? 0 },
      ],
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
        Reports & Analytics
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
        Operational metrics across the CAGE platform.
      </p>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {s.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.metrics.map((m) => (
                <div key={m.label} className="card p-4">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {m.label}
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
