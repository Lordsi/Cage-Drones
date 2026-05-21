"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { homePathForRole, type UserRole } from "@/lib/profile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    const { data: row } = await supabase.from("profiles").select("role").single();
    const role = (row?.role as UserRole | undefined) ?? "student";
    router.push(homePathForRole(role));
    router.refresh();
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "var(--deep)" }}
    >
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>CAGE</span>
        <span className="text-xl font-medium" style={{ color: "var(--text)" }}>Portal</span>
      </Link>

      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-bold" style={{ color: "var(--text)" }}>Sign in</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          Access your training dashboard and flight management tools.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--input-border)",
                color: "var(--text)",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--input-border)",
                color: "var(--text)",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary justify-center py-2.5 text-sm disabled:opacity-60"
            style={{ borderRadius: "4px" }}
          >
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {message ? (
          <p
            className="mt-4 text-center text-sm"
            style={{ color: status === "error" ? "var(--red)" : "var(--muted)" }}
          >
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          <Link href="/register" className="font-medium underline" style={{ color: "var(--accent)" }}>
            Create an account
          </Link>
          {" · "}
          <Link href="/" className="underline" style={{ color: "var(--muted2)" }}>
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
