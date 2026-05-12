import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export type ReviewRow = {
  question_id: string;
  prompt: string;
  choices: string[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
};

export function ExamReview({
  examTitle,
  score,
  rows,
}: {
  examTitle: string;
  score: number;
  rows: ReviewRow[];
}) {
  const pass = score >= 75;
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ background: "var(--deep)" }}
    >
      <div className="card w-full max-w-lg rounded-3xl p-10 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 text-4xl"
          style={{
            background: pass ? "rgba(34,211,163,.15)" : "rgba(255,101,53,.15)",
            borderColor: pass ? "var(--green)" : "var(--orange)",
          }}
        >
          {pass ? "🎯" : "📚"}
        </div>
        <div
          className="display text-6xl font-black leading-none"
          style={{ color: pass ? "var(--green)" : "var(--orange)" }}
        >
          {score}%
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
          {examTitle}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
          {pass ? "Great work — you passed this attempt." : "Review the material and try again when ready."}
        </p>

        <div className="mt-8 max-h-64 overflow-y-auto text-left">
          <div className="display mb-3 text-sm font-bold">Review</div>
          <ul className="space-y-2 text-sm">
            {rows.map((r) => (
              <li
                key={r.question_id}
                className="flex gap-2 border-b py-2"
                style={{ borderColor: "var(--border)" }}
              >
                {r.is_correct ? (
                  <CheckCircle size={16} color="var(--green)" className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} color="var(--orange)" className="mt-0.5 shrink-0" />
                )}
                <span style={{ color: "var(--muted2)" }}>{r.prompt.slice(0, 120)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/portal/exams" className="mt-8 block">
          <button type="button" className="btn-primary w-full justify-center rounded-xl py-3 text-sm">
            Back to exams
          </button>
        </Link>
      </div>
    </div>
  );
}
