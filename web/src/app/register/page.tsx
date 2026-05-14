"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { homePathForRole, type UserRole } from "@/lib/profile";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "check_email">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() || undefined },
      },
    });
    if (error) {
      setStatus("error");
      const raw = error.message ?? "";
      if (/email_not_allowlisted/i.test(raw) || /not allow/i.test(raw)) {
        setMessage(
          "This email is not on the student allow-list. Ask your administrator to add it before registering.",
        );
      } else {
        setMessage(raw || "Could not create account.");
      }
      return;
    }
    if (data.session) {
      const { data: row } = await supabase.from("profiles").select("role").single();
      const role = (row?.role as UserRole | undefined) ?? "student";
      router.push(homePathForRole(role));
      router.refresh();
      return;
    }
    setStatus("check_email");
    setMessage(
      "Check your email to confirm your address, then sign in. If confirmations are disabled in Supabase, try signing in now.",
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "var(--deep)" }}
    >
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ background: "var(--accent)", color: "#fff" }}>C</div>
        <span className="text-xl font-bold">
          CAGE<span style={{ color: "var(--accent)" }}> Portal</span>
        </span>
      </Link>
      <div className="card w-full max-w-md rounded-xl p-8">
        <h1 className="mb-2 text-2xl font-bold">Create account</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted2)" }}>
          New accounts are <strong>students</strong> by default and your email must be on the
          student allow-list — ask an administrator to add it before registering. Roles can be
          upgraded later in Administration → Users.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            autoComplete="name"
            placeholder="Full name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary justify-center rounded-lg py-3 text-sm disabled:opacity-60"
          >
            {status === "loading" ? "Creating…" : "Create account"}
          </button>
        </form>
        {message ? (
          <p
            className="mt-4 text-center text-sm"
            style={{ color: status === "error" ? "var(--orange)" : "var(--muted2)" }}
          >
            {message}
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          <Link href="/login" className="underline" style={{ color: "var(--accent)" }}>
            Already have an account? Sign in
          </Link>
          {" · "}
          <Link href="/" className="underline" style={{ color: "var(--accent)" }}>
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
