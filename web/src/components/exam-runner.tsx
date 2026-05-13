"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Award } from "lucide-react";
import { saveExamAnswers, submitExamAttempt } from "@/app/actions/exams";

export type ExamQuestionRow = {
  id: string;
  sort_order: number;
  prompt: string;
  choices: string[];
};

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ExamRunner({
  attemptId,
  examTitle,
  endsAtIso,
  questions,
  initialAnswers,
}: {
  attemptId: string;
  examTitle: string;
  endsAtIso: string;
  questions: ExamQuestionRow[];
  initialAnswers: Record<string, number>;
}) {
  const router = useRouter();
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sort_order - b.sort_order),
    [questions],
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [timeLeft, setTimeLeft] = useState(() => {
    const end = new Date(endsAtIso).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const q = sorted[currentQ];
  const total = sorted.length;
  const answered = Object.keys(answers).length;

  const flushSave = useCallback(async () => {
    await saveExamAnswers(attemptId, answersRef.current);
  }, [attemptId]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveExamAnswers(attemptId, answers);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [attemptId, answers]);

  useEffect(() => {
    const t = setInterval(() => {
      const end = new Date(endsAtIso).getTime();
      const next = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(next);
      if (next <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(t);
        void (async () => {
          await flushSave();
          try {
            await submitExamAttempt(attemptId, answersRef.current);
          } catch {
            finishedRef.current = false;
          }
          router.refresh();
        })();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [endsAtIso, attemptId, router, flushSave]);

  async function onSubmit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    await flushSave();
    await submitExamAttempt(attemptId, answersRef.current);
    router.refresh();
  }

  function selectAnswer(idx: number) {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  function getOptClass(i: number) {
    if (!q) return "opt-btn";
    return answers[q.id] === i ? "opt-btn opt-selected" : "opt-btn";
  }

  function getQClass(i: number) {
    if (i === currentQ) return "q-nav-btn q-current";
    const qq = sorted[i];
    if (qq && answers[qq.id] !== undefined) return "q-nav-btn q-answered";
    return "q-nav-btn q-unanswered";
  }

  const timerDanger = timeLeft < 120;

  if (!q) {
    return (
      <p className="p-8 text-sm" style={{ color: "var(--muted2)" }}>
        No questions in this exam.
      </p>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--deep)" }}>
      <header
        className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b px-8"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="btn-ghost rounded-md px-3 py-1 text-xs"
            onClick={() => {
              if (confirm("Leave exam? Your progress is saved.")) router.push("/portal/exams");
            }}
          >
            <ChevronLeft size={15} /> Exit
          </button>
          <div className="h-7 w-px" style={{ background: "var(--border)" }} />
          <span className="text-sm font-bold">{examTitle}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div
              className="text-[0.68rem] uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Progress
            </div>
            <div className="text-sm font-bold">
              {answered}/{total}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-[0.68rem] uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Time left
            </div>
            <div
              className={`text-lg font-black ${timerDanger ? "timer-danger" : ""}`}
              style={{ color: timerDanger ? "var(--orange)" : "var(--accent)" }}
            >
              <Clock size={12} className="mr-1 inline" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <div className="prog-track h-[3px] rounded-none" style={{ background: "var(--border)" }}>
        <div className="prog-fill h-full" style={{ width: `${(answered / total) * 100}%` }} />
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 overflow-y-auto p-10">
          <div className="mx-auto max-w-[700px]">
            <div className="mb-8">
              <span
                className="text-[0.68rem] font-bold uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Question {currentQ + 1} of {total}
              </span>
              <h2 className="mt-3 text-xl font-bold leading-relaxed">{q.prompt}</h2>
            </div>
            <div className="grid gap-3">
              {q.choices.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${getOptClass(i)} flex items-center gap-4`}
                  onClick={() => selectAnswer(i)}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{ background: "rgba(255,255,255,.06)" }}
                  >
                    {["A", "B", "C", "D"][i] ?? String(i + 1)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button
                type="button"
                className="btn-ghost rounded-lg px-5 py-2 text-sm"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {currentQ < total - 1 ? (
                <button
                  type="button"
                  className="btn-outline rounded-lg px-5 py-2 text-sm"
                  onClick={() => setCurrentQ((c) => Math.min(total - 1, c + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary rounded-lg px-6 py-2 text-sm"
                  onClick={() => void onSubmit()}
                >
                  Submit exam <Award size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside
          className="w-full border-t p-6 md:w-[280px] md:border-l md:border-t-0"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="mb-4 text-[0.78rem] font-bold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            Questions
          </div>
          <div className="mb-6 grid grid-cols-5 gap-1.5">
            {sorted.map((_, i) => (
              <button key={i} type="button" className={getQClass(i)} onClick={() => setCurrentQ(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="divider mb-4" />
          {answered === total ? (
            <button
              type="button"
              className="btn-primary flex w-full justify-center rounded-lg py-3 text-sm"
              onClick={() => void onSubmit()}
            >
              Submit exam <Award size={16} />
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
