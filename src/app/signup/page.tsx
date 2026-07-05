"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";
import type { UserType } from "@/lib/api/types";

const roles: Array<{ id: UserType; label: string }> = [
  { id: "student", label: "Student" },
  { id: "parent", label: "Parent" },
  { id: "school", label: "School" },
  { id: "tuition", label: "Tuition / Coaching Institute" },
];

function SignupForm() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserType>("student");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms and privacy policy.");
      return;
    }
    setBusy(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        userType,
      });
      toast(`Welcome to Gyan Hub, ${user.name.split(" ")[0]}! 🎒`, "success");
      router.push(next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create your account right now.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-copy">
          <span className="eyebrow">Sign up</span>
          <h1>Create your account</h1>
          <p className="lead">
            One account for shopping, selling back, donating — and advertising
            if you opt in later.
          </p>
        </div>

        {error ? (
          <div className="form-alert form-alert--error">{error}</div>
        ) : null}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="full-name">Full name *</label>
            <input
              id="full-name"
              autoComplete="name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="role">I am a…</label>
            <select
              id="role"
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-password">Confirm password *</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I agree to the <Link href="/terms-and-conditions">terms</Link> and{" "}
            <Link href="/privacy-policy">privacy policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="auth-note">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
