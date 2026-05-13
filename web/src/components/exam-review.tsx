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
  passPercent,
  rows,
}: {
  examTitle: string;
  score: number;
  passPercent: number;
  rows: ReviewRow[];
}) {
  const pass = score >= passPercent;
  const correct = rows.filter((r) => r.is_correct).length;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ background: "var(--deep)" }}
    >
      <div className="card w-full max-w-lg rounded-3xl p-10 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2"
          style={{
            background: pass
              ? "rgba(34,211,163,.15)"
              : "rgba(255,101,53,.15)",
            borderColor: pass ? "var(--green)" : "var(--orange)",
          }}
        >
          {pass ? (
            <CheckCircle size={36} color="var(--green)" />
          ) : (
            <XCircle size={36} color="var(--orange)" />
          )}
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
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          {correct} of {rows.length} correct · Pass mark: {passPercent}%
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted2)" }}>
          {pass
            ? "Great work — you passed this attempt."
            : "Review the material and try again when ready."}
        </p>

        <div className="mt-8 max-h-80 overflow-y-auto text-left">
          <div className="display mb-3 text-sm font-bold">
            Question review
          </div>
          <ul className="space-y-2 text-sm">
            {rows.map((r, i) => (
              <li
                key={r.question_id}
                className="border-b py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex gap-2">
                  {r.is_correct ? (
                    <CheckCircle
                      size={16}
                      color="var(--green)"
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={16}
                      color="var(--orange)"
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Q{i + 1}.</span>{" "}
                    <span style={{ color: "var(--muted2)" }}>
                      {r.prompt}
                    </span>
                    {r.choices.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {r.choices.map((c, ci) => {
                          const isCorrect = ci === r.correct_index;
                          const isSelected = ci === r.selected_index;
                          let style: React.CSSProperties = {
                            color: "var(--muted2)",
                          };
                          if (isCorrect)
                            style = {
                              color: "var(--green)",
                              fontWeight: 600,
                            };
                          else if (isSelected && !isCorrect)
                            style = {
                              color: "var(--orange)",
                              textDecoration: "line-through",
                            };
                          return (
                            <li
                              key={ci}
                              className="text-xs"
                              style={style}
                            >
                              {String.fromCharCode(65 + ci)}. {c}
                              {isCorrect && " ✓"}
                              {isSelected && !isCorrect && " (your answer)"}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/portal/exams" className="mt-8 block">
          <button
            type="button"
            className="btn-primary w-full justify-center rounded-xl py-3 text-sm"
          >
            Back to exams
          </button>
        </Link>
      </div>
    </div>
  );
}
