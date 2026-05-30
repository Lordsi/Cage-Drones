"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/actions/bookings";

export function AdminRequestRow({
  id,
  kind,
  status,
  statuses,
  adminNotes,
}: {
  id: string;
  kind: "booking" | "quotation" | "application";
  status: string;
  statuses: string[];
  adminNotes: string;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(adminNotes);
  const [s, setS] = useState(status);
  const [isPending, startTransition] = useTransition();

  function save(nextStatus?: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("kind", kind);
    fd.set("status", nextStatus ?? s);
    fd.set("admin_notes", notes);
    startTransition(() => updateBookingStatus(fd));
    if (nextStatus) setS(nextStatus);
    setOpen(false);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        value={s}
        onChange={(e) => setS(e.target.value)}
        className="rounded border px-2 py-1 text-xs outline-none"
        style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
      >
        {statuses.map((st) => (
          <option key={st} value={st}>{st}</option>
        ))}
      </select>
      <button
        type="button"
        className="btn-ghost px-3 py-1 text-xs"
        style={{ borderRadius: 4 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Cancel notes" : "Notes"}
      </button>
      <button
        type="button"
        disabled={isPending}
        className="btn-primary px-3 py-1 text-xs"
        style={{ borderRadius: 4 }}
        onClick={() => save()}
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      {open && (
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes (private)"
          className="mt-2 w-full rounded border px-2 py-1 text-sm outline-none"
          style={{ background: "var(--card)", borderColor: "var(--input-border)", color: "var(--text)" }}
        />
      )}
    </div>
  );
}
