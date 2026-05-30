import { createClient } from "@/lib/supabase/server";
import { createCohort, updateCohortStatus } from "@/app/actions/bookings";

export default async function TeacherCohortsPage() {
  const supabase = await createClient();
  const [{ data: cohorts }, { data: courses }] = await Promise.all([
    supabase
      .from("training_cohorts")
      .select("*, course:course_id ( id, title )")
      .order("starts_on", { ascending: true }),
    supabase.from("courses").select("id, title").order("title"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Training Cohorts
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          These scheduled cohorts feed the public landing page training schedule.
        </p>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Add cohort
        </h2>
        <form action={createCohort} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input name="code" placeholder="Code (e.g. REPL-2410)" required />
          <Input name="title" placeholder="Title (e.g. RePL Multi-Rotor)" required />
          <Input name="location" placeholder="Location" />
          <Input name="starts_on" type="date" required />
          <Input name="ends_on" type="date" />
          <Input name="capacity" type="number" defaultValue="12" />
          <Input name="price_display" placeholder="Price (e.g. $1,950)" />
          <select name="status" defaultValue="open" className="cage-input" style={inputStyle}>
            <option value="open">open</option>
            <option value="waitlist">waitlist</option>
            <option value="closed">closed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select name="course_id" defaultValue="" className="cage-input" style={inputStyle}>
            <option value="">— Link to course (optional)</option>
            {(courses ?? []).map((c) => (
              <option key={c.id as string} value={c.id as string}>{c.title as string}</option>
            ))}
          </select>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary px-4 py-2 text-sm" style={{ borderRadius: 4 }}>
              Add cohort
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {(cohorts ?? []).length === 0 ? (
          <p className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            No cohorts scheduled yet.
          </p>
        ) : (
          (cohorts ?? []).map((c) => (
            <div key={c.id as string} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {c.code as string} · {c.title as string}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {(c.location as string) || "—"} · {fmt(c.starts_on as string)}
                  {c.ends_on ? ` → ${fmt(c.ends_on as string)}` : ""} · Cap {c.capacity as number}
                  {c.price_display ? ` · ${c.price_display as string}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={updateCohortStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={c.id as string} />
                  <select
                    name="status"
                    defaultValue={c.status as string}
                    className="rounded border px-2 py-1 text-xs outline-none"
                    style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
                  >
                    <option value="open">open</option>
                    <option value="waitlist">waitlist</option>
                    <option value="closed">closed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <button type="submit" className="btn-ghost px-3 py-1 text-xs" style={{ borderRadius: 4 }}>
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function fmt(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="cage-input" style={inputStyle} />;
}

const inputStyle = {
  background: "var(--card)",
  border: "1px solid var(--input-border)",
  borderRadius: 4,
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "var(--text)",
} as const;
