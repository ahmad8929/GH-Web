"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useToast } from "@/context/toast-context";
import { AuthApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await AuthApi.forgotPassword(email.trim());
      setInfo(
        "If this email is registered, an OTP is on its way. It expires in 10 minutes.",
      );
      setStep("otp");
    } catch (err) {
      fail(err, "Could not send the OTP right now.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await AuthApi.verifyOtp(email.trim(), code.trim());
      setInfo(null);
      setStep("reset");
    } catch (err) {
      fail(err, "Could not verify the OTP.");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
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
    setBusy(true);
    try {
      await AuthApi.resetPassword(email.trim(), code.trim(), password);
      toast("Password reset! Please log in.", "success");
      router.push("/login");
    } catch (err) {
      fail(err, "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <form
        className="auth-form auth-form--narrow"
        onSubmit={
          step === "email" ? sendOtp : step === "otp" ? verifyOtp : resetPassword
        }
      >
        <div className="auth-copy">
          <span className="eyebrow">Reset password</span>
          <h1>
            {step === "email"
              ? "Forgot your password?"
              : step === "otp"
                ? "Check your inbox"
                : "Set a new password"}
          </h1>
          <p className="lead">
            {step === "email"
              ? "We'll email you a one-time code."
              : step === "otp"
                ? `Enter the 6-digit code we sent to ${email}.`
                : "Almost done — pick something memorable."}
          </p>
        </div>

        {error ? (
          <div className="form-alert form-alert--error">{error}</div>
        ) : null}
        {info && !error ? (
          <div className="form-alert form-alert--info">{info}</div>
        ) : null}

        {step === "email" ? (
          <div className="field">
            <label htmlFor="fp-email">Email</label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="you@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="field">
            <label htmlFor="fp-otp">One-time code</label>
            <input
              id="fp-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
        ) : null}

        {step === "reset" ? (
          <>
            <div className="field">
              <label htmlFor="fp-password">New password</label>
              <input
                id="fp-password"
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
              <label htmlFor="fp-confirm">Confirm new password</label>
              <input
                id="fp-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </>
        ) : null}

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={busy}
        >
          {busy
            ? "Working…"
            : step === "email"
              ? "Send code"
              : step === "otp"
                ? "Verify code"
                : "Reset password"}
        </button>

        {step === "otp" ? (
          <button
            type="button"
            className="button button--ghost button--full"
            onClick={(e) => sendOtp(e as unknown as FormEvent)}
            disabled={busy}
          >
            Resend code
          </button>
        ) : null}

        <div className="auth-links">
          <Link href="/login">Back to login</Link>
          <Link href="/signup">Create account</Link>
        </div>
      </form>
    </section>
  );
}
