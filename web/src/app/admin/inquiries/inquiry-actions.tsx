"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { updateInquiryStatus, updateInquiryNotes } from "@/app/actions/inquiry-admin";

interface InquiryActionsProps {
  id: string;
  email: string;
  status: string;
  adminNotes: string;
}

export function InquiryActions({ id, email, status, adminNotes }: InquiryActionsProps) {
  const router = useRouter();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(adminNotes);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      router.refresh();
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateInquiryNotes(id, notes);
      setShowNotes(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {status !== "admitted" && (
        <button
          className="btn-primary px-3 py-1.5 text-xs"
          onClick={() => handleStatusChange("admitted")}
          disabled={isPending}
        >
          <CheckCircle size={13} /> Admit
        </button>
      )}

      {status !== "contacted" && status !== "admitted" && (
        <button
          className="btn-outline px-3 py-1.5 text-xs"
          onClick={() => handleStatusChange("contacted")}
          disabled={isPending}
        >
          <MessageSquare size={13} /> Mark Contacted
        </button>
      )}

      <a
        href={`mailto:${email}?subject=CAGE%20Enrollment%20Inquiry`}
        className="btn-outline px-3 py-1.5 text-xs"
      >
        <Mail size={13} /> Email
      </a>

      <button
        className="btn-ghost px-3 py-1.5 text-xs"
        onClick={() => setShowNotes(!showNotes)}
      >
        <MessageSquare size={13} /> {showNotes ? "Cancel" : "Notes"}
      </button>

      {status !== "rejected" && (
        <button
          className="btn-ghost px-3 py-1.5 text-xs"
          style={{ color: "var(--red)" }}
          onClick={() => handleStatusChange("rejected")}
          disabled={isPending}
        >
          <XCircle size={13} /> Reject
        </button>
      )}

      {showNotes && (
        <div className="mt-3 w-full">
          <textarea
            className="w-full rounded border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--input-border)",
              background: "var(--surface)",
              color: "var(--text)",
            }}
            rows={3}
            placeholder="Add internal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            className="btn-primary mt-2 px-3 py-1.5 text-xs"
            onClick={handleSaveNotes}
            disabled={isPending}
          >
            Save Notes
          </button>
        </div>
      )}
    </div>
  );
}
