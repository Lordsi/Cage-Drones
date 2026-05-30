"use client";

import { useState, useTransition } from "react";
import { saveChecklist } from "@/app/actions/flights";
import { checklistCompletion, type ChecklistItem } from "@/lib/flight-checklists";

export function FlightChecklist({
  flightId,
  which,
  items: initial,
  readOnly,
}: {
  flightId: string;
  which: "preflight" | "postflight";
  items: ChecklistItem[];
  readOnly?: boolean;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(initial);
  const [isPending, startTransition] = useTransition();
  const stats = checklistCompletion(items);

  function update(i: number, patch: Partial<ChecklistItem>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  }

  function submit() {
    const fd = new FormData();
    fd.set("id", flightId);
    fd.set("which", which);
    items.forEach((it, i) => {
      fd.set(`item_${i}`, it.item);
      if (it.ok) fd.set(`ok_${i}`, "on");
      if (it.notes) fd.set(`notes_${i}`, it.notes);
    });
    startTransition(async () => {
      await saveChecklist(fd);
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            {which === "preflight" ? "Pre-flight checklist" : "Post-flight checklist"}
          </h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {stats.done} of {stats.total} complete ({stats.percent}%)
          </p>
        </div>
        <div className="prog-track h-1.5 w-40">
          <div className="prog-fill" style={{ width: `${stats.percent}%` }} />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded border p-3"
            style={{ borderColor: it.ok ? "color-mix(in srgb, var(--green) 30%, var(--border))" : "var(--border)" }}
          >
            <input
              type="checkbox"
              checked={it.ok}
              disabled={readOnly}
              onChange={(e) => update(i, { ok: e.target.checked })}
              className="mt-1 h-4 w-4"
            />
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {it.item}
              </div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={it.notes ?? ""}
                disabled={readOnly}
                onChange={(e) => update(i, { notes: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1 text-xs outline-none"
                style={{ background: "var(--surface)", borderColor: "var(--input-border)", color: "var(--text)" }}
              />
            </div>
          </li>
        ))}
      </ul>

      {!readOnly && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="btn-primary px-4 py-2 text-sm"
            style={{ borderRadius: 4, opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? "Saving…" : "Save checklist"}
          </button>
        </div>
      )}
    </div>
  );
}
