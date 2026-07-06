"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/context/toast-context";
import { AdvertiseApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { AdPlan, AdSubscription } from "@/lib/api/types";
import { inr } from "@/lib/format";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function AdCheckoutPage() {
  const { user, ready } = useAuthGuard();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<AdPlan | null>(null);
  const [history, setHistory] = useState<AdSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [plansRes, mineRes] = await Promise.all([
        AdvertiseApi.plans(),
        AdvertiseApi.mySubscriptions(),
      ]);
      if (cancelled) return;
      setPlan(plansRes?.data?.find((p) => p.id === params.planId) ?? null);
      setHistory(mineRes?.data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, params.planId]);

  const alreadyOwned = history.some((s) => s.planId === params.planId);

  const confirmCheckout = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const res = await AdvertiseApi.subscribe(plan.id);
      if (res) {
        toast("Payment confirmed — your plan is active!", "success");
        router.push("/advertise");
      } else {
        toast("Plan purchase opens soon!", "info");
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Checkout failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !user || loading) {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading checkout…</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="empty-state">
        <span className="empty-state__emoji" aria-hidden>
          🤔
        </span>
        <h3>Plan not found</h3>
        <p>This plan may no longer be available.</p>
        <Link href="/advertise" className="button button--primary">
          Back to plans
        </Link>
      </div>
    );
  }

  return (
    <div className="section-stack">
      <section className="section">
        <span className="eyebrow">Checkout</span>
        <h1>Confirm your plan</h1>

        <div className="checkout-section panel">
          <div className="summary-row">
            <span>{plan.name}</span>
            <strong>{inr(plan.price)}</strong>
          </div>
          {plan.description ? <p className="auth-note">{plan.description}</p> : null}
          <p className="auth-note">
            {plan.durationDays} days of placement. This is a simulated
            payment for now — no card details are collected; a real gateway
            can slot in here later without changing this flow.
          </p>

          {alreadyOwned ? (
            <p className="form-alert form-alert--error">
              You&apos;ve already purchased this plan. Choose a different plan
              to run another ad.
            </p>
          ) : (
            <button
              type="button"
              className="button button--primary button--full"
              onClick={confirmCheckout}
              disabled={busy}
            >
              {busy ? "Confirming…" : `Confirm & pay ${inr(plan.price)} (simulated)`}
            </button>
          )}
          <Link href="/advertise" className="auth-note">
            ← Back to plans
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Your payment history</h2>
        {history.length === 0 ? (
          <p className="auth-note">No purchases yet.</p>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Purchased</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id}>
                    <td>{s.plan?.name ?? "—"}</td>
                    <td>{s.amountPaid ? inr(s.amountPaid) : "—"}</td>
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <span
                        className={`badge ${s.status === "active" ? "badge--mint" : s.status === "cancelled" || s.status === "expired" ? "badge--coral" : "badge--sun"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
