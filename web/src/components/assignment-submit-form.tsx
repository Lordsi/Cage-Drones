"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSubmissionRow, finalizeSubmission } from "@/app/actions/assignments";

export function AssignmentSubmitForm({
  assignmentId,
  userId,
  resubmit,
}: {
  assignmentId: string;
  userId: string;
  resubmit?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    if (!file || file.size === 0) {
      setMsg("Choose a file.");
      return;
    }
    setBusy(true);
    try {
      await ensureSubmissionRow(assignmentId);
      const path = `${assignmentId}/${userId}/${file.name}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("assignment-submissions")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      await finalizeSubmission(assignmentId, path);
      setMsg(resubmit ? "Resubmitted!" : "Submitted!");
      e.currentTarget.reset();
      router.refresh();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-end gap-2">
      <input
        name="file"
        type="file"
        required
        className="max-w-[220px] text-xs"
        style={{ color: "var(--muted2)" }}
      />
      <button
        type="submit"
        disabled={busy}
        className="btn-primary rounded-lg px-4 py-2 text-xs disabled:opacity-60"
      >
        {busy
          ? "Uploading…"
          : resubmit
            ? "Resubmit"
            : "Submit"}
      </button>
      {msg ? (
        <span className="text-xs" style={{ color: "var(--muted2)" }}>
          {msg}
        </span>
      ) : null}
    </form>
  );
}
