import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { issueCertificate, revokeCertificate } from "@/app/actions/certificates";

type ProfileRow = { display_name: string };

function oneProfile(raw: unknown): ProfileRow | null {
  const p = (Array.isArray(raw) ? raw[0] : raw) as ProfileRow | null;
  return p;
}

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course, error: cErr } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();
  if (cErr || !course) notFound();

  const { data: roster } = await supabase
    .from("enrollments")
    .select("user_id, profiles ( display_name )")
    .eq("course_id", courseId)
    .order("user_id");

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title")
    .eq("course_id", courseId)
    .eq("published", true)
    .order("title");

  const { data: assigns } = await supabase
    .from("assignments")
    .select("id, title")
    .eq("course_id", courseId)
    .order("title");

  const examIds = (exams ?? []).map((e) => e.id as string);
  const assignIds = (assigns ?? []).map((a) => a.id as string);
  const userIds = (roster ?? []).map((r) => r.user_id as string);

  const { data: attempts } =
    examIds.length && userIds.length
      ? await supabase
          .from("exam_attempts")
          .select("exam_id, user_id, score_percent, submitted_at")
          .in("exam_id", examIds)
          .in("user_id", userIds)
          .not("submitted_at", "is", null)
      : { data: [] as Record<string, unknown>[] };

  const bestExam = new Map<string, number>();
  for (const row of attempts ?? []) {
    const uid = row.user_id as string;
    const eid = row.exam_id as string;
    const k = `${uid}:${eid}`;
    const score = row.score_percent as number;
    const prev = bestExam.get(k);
    if (prev == null || score > prev) bestExam.set(k, score);
  }

  const { data: subRows } =
    assignIds.length && userIds.length
      ? await supabase
          .from("assignment_submissions")
          .select("user_id, assignment_id, grade, status")
          .in("assignment_id", assignIds)
          .in("user_id", userIds)
      : { data: [] as Record<string, unknown>[] };

  const assignCell = new Map<string, string>();
  for (const s of subRows ?? []) {
    const k = `${s.user_id as string}:${s.assignment_id as string}`;
    const g = s.grade as string | null;
    const st = s.status as string;
    assignCell.set(k, g && g.length > 0 ? g : st);
  }

  const examColAvg = new Map<string, number>();
  for (const ex of exams ?? []) {
    const eid = ex.id as string;
    const scores: number[] = [];
    for (const r of roster ?? []) {
      const v = bestExam.get(`${r.user_id as string}:${eid}`);
      if (v != null) scores.push(v);
    }
    if (scores.length > 0) {
      examColAvg.set(
        eid,
        Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      );
    }
  }

  const { data: existingCerts } = userIds.length
    ? await supabase
        .from("certificates")
        .select("id, user_id, serial, grade, revoked")
        .eq("course_id", courseId)
        .in("user_id", userIds)
    : { data: [] as Record<string, unknown>[] };
  const certByUser = new Map<string, Record<string, unknown>>();
  for (const c of existingCerts ?? []) certByUser.set(c.user_id as string, c);

  const rowAvg = new Map<string, number>();
  for (const r of roster ?? []) {
    const uid = r.user_id as string;
    const scores: number[] = [];
    for (const ex of exams ?? []) {
      const v = bestExam.get(`${uid}:${ex.id as string}`);
      if (v != null) scores.push(v);
    }
    if (scores.length > 0) {
      rowAvg.set(
        uid,
        Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      );
    }
  }

  function cellStyle(score: number | undefined) {
    if (score == null) return { color: "var(--muted)" };
    if (score >= 70)
      return {
        background: "color-mix(in srgb, var(--green) 12%, transparent)",
        color: "var(--green)",
      };
    if (score >= 50)
      return {
        background: "color-mix(in srgb, var(--orange) 12%, transparent)",
        color: "var(--orange)",
      };
    return {
      background: "color-mix(in srgb, var(--orange) 20%, transparent)",
      color: "var(--orange)",
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Gradebook</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string} — best exam score per assessment; assignment
        shows grade or status.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                className="sticky left-0 z-10 px-3 py-3 font-bold"
                style={{ background: "var(--surface)" }}
              >
                Student
              </th>
              {(exams ?? []).map((ex) => (
                <th
                  key={ex.id as string}
                  className="whitespace-nowrap px-2 py-3 text-center font-semibold"
                >
                  <span className="line-clamp-2 max-w-[120px]">
                    {ex.title as string}
                  </span>
                  <span
                    className="mt-0.5 block font-normal uppercase tracking-wide"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}
                  >
                    Exam
                  </span>
                  {examColAvg.has(ex.id as string) && (
                    <span
                      className="block font-bold"
                      style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}
                    >
                      Avg: {examColAvg.get(ex.id as string)}%
                    </span>
                  )}
                </th>
              ))}
              {(assigns ?? []).map((a) => (
                <th
                  key={a.id as string}
                  className="whitespace-nowrap px-2 py-3 text-center font-semibold"
                >
                  <span className="line-clamp-2 max-w-[120px]">
                    {a.title as string}
                  </span>
                  <span
                    className="mt-0.5 block font-normal uppercase tracking-wide"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}
                  >
                    HW
                  </span>
                </th>
              ))}
              <th
                className="px-2 py-3 text-center font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {(roster ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={
                    2 + (exams ?? []).length + (assigns ?? []).length
                  }
                  className="px-3 py-10 text-center"
                  style={{ color: "var(--muted2)" }}
                >
                  No students enrolled.
                </td>
              </tr>
            ) : (
              (roster ?? []).map((r) => {
                const uid = r.user_id as string;
                const prof = oneProfile(r.profiles);
                const avg = rowAvg.get(uid);
                return (
                  <tr
                    key={uid}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="sticky left-0 z-10 px-3 py-2 font-medium"
                      style={{ background: "var(--surface)" }}
                    >
                      {prof?.display_name ?? "Student"}
                      <div
                        className="text-[0.6rem]"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                      >
                        {uid.slice(0, 8)}…
                      </div>
                    </td>
                    {(exams ?? []).map((ex) => {
                      const score = bestExam.get(
                        `${uid}:${ex.id as string}`,
                      );
                      return (
                        <td
                          key={ex.id as string}
                          className="px-2 py-2 text-center font-medium"
                          style={cellStyle(score)}
                        >
                          {score != null ? `${score}%` : "—"}
                        </td>
                      );
                    })}
                    {(assigns ?? []).map((a) => {
                      const v = assignCell.get(
                        `${uid}:${a.id as string}`,
                      );
                      const isGraded = v && !["pending", "submitted", "graded"].includes(v);
                      return (
                        <td
                          key={a.id as string}
                          className="px-2 py-2 text-center"
                          style={
                            v === "graded"
                              ? { color: "var(--green)" }
                              : v === "submitted"
                                ? { color: "var(--orange)" }
                                : isGraded
                                  ? { color: "var(--green)", fontWeight: 600 }
                                  : { color: "var(--muted)" }
                          }
                        >
                          {v ?? "—"}
                        </td>
                      );
                    })}
                    <td
                      className="px-2 py-2 text-center font-bold"
                      style={cellStyle(avg)}
                    >
                      {avg != null ? `${avg}%` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
            {(roster ?? []).length > 0 && (
              <tr
                style={{
                  borderTop: "2px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <td
                  className="sticky left-0 z-10 px-3 py-2 font-bold uppercase tracking-widest"
                  style={{
                    background: "var(--surface)",
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                  }}
                >
                  Class Avg
                </td>
                {(exams ?? []).map((ex) => {
                  const avg = examColAvg.get(ex.id as string);
                  return (
                    <td
                      key={ex.id as string}
                      className="px-2 py-2 text-center font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {avg != null ? `${avg}%` : "—"}
                    </td>
                  );
                })}
                {(assigns ?? []).map((a) => (
                  <td
                    key={a.id as string}
                    className="px-2 py-2 text-center"
                    style={{ color: "var(--muted)" }}
                  >
                    —
                  </td>
                ))}
                <td className="px-2 py-2 text-center font-bold" style={{ color: "var(--accent)" }}>
                  {(() => {
                    const allAvgs = Array.from(rowAvg.values());
                    if (allAvgs.length === 0) return "—";
                    return `${Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)}%`;
                  })()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-[0.68rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Certificates
        </h2>
        {(roster ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No students enrolled.</p>
        ) : (
          <div className="space-y-2">
            {(roster ?? []).map((r) => {
              const uid = r.user_id as string;
              const prof = oneProfile(r.profiles);
              const avg = rowAvg.get(uid);
              const cert = certByUser.get(uid);
              return (
                <div key={uid} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {prof?.display_name ?? "Student"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      {avg != null ? `Avg ${avg}%` : "No graded exams yet"}
                      {cert ? ` · ${cert.serial as string}` : ""}
                    </div>
                  </div>
                  {cert ? (
                    cert.revoked ? (
                      <span className="badge badge-red">revoked</span>
                    ) : (
                      <form action={revokeCertificate} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={cert.id as string} />
                        <input
                          name="reason"
                          placeholder="Revoke reason"
                          className="rounded border px-2 py-1 text-xs outline-none"
                          style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
                        />
                        <button type="submit" className="btn-ghost px-3 py-1 text-xs" style={{ borderRadius: 4, color: "var(--red)" }}>
                          Revoke
                        </button>
                      </form>
                    )
                  ) : (
                    <form action={issueCertificate} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="course_id" value={courseId} />
                      <input type="hidden" name="user_id" value={uid} />
                      <input
                        name="grade"
                        placeholder="Grade (e.g. Pass)"
                        defaultValue={avg != null && avg >= 70 ? "Pass" : ""}
                        className="rounded border px-2 py-1 text-xs outline-none"
                        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
                      />
                      <button type="submit" className="btn-primary px-3 py-1 text-xs" style={{ borderRadius: 4 }}>
                        Issue certificate
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
