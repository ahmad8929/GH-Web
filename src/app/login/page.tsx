"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";

function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
      router.push(next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not log in right now.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form auth-form--narrow" onSubmit={onSubmit}>
        <div className="auth-copy">
          <span className="eyebrow">Login</span>
          <h1>Welcome back</h1>
          <p className="lead">Your orders, favorites, and listings await.</p>
        </div>

        {error ? (
          <div className="form-alert form-alert--error">{error}</div>
        ) : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="student@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={busy}
        >
          {busy ? "Logging in…" : "Login"}
        </button>

        <div className="auth-links">
          <Link href="/signup">Create account</Link>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
