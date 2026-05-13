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
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ background: "var(--accent)", color: "#fff" }}>C</div>
        <span className="text-xl font-bold">
          CAGE<span style={{ color: "var(--accent)" }}> Portal</span>
        </span>
      </Link>
      <div className="card w-full max-w-md rounded-xl p-8">
        <h1 className="mb-2 text-2xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted2)" }}>
          Use your email and password. Admins land on Administration; teachers on the Teacher portal;
          students on the learning hub.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            autoComplete="current-password"
            placeholder="Password"
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
            {status === "loading" ? "Signing in…" : "Sign in"}
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
          <Link href="/register" className="underline" style={{ color: "var(--accent)" }}>
            Create an account
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
