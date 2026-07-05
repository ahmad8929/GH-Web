"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ComingSoon } from "@/components/empty-state";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { AdvertiseApi } from "@/lib/api/endpoints";
import type { AdPlan } from "@/lib/api/types";
import { inr } from "@/lib/format";

/**
 * Contract-first advertiser hub. Opt-in, plans, and creative upload run
 * behind capability flags; everything lights up when the backend ships
 * PATCH /profile/me { isAdvertiser }, GET /ad-plans, POST /ad-subscriptions.
 */

const PLACEHOLDER_PLANS: Array<AdPlan & { placeholder: true }> = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    durationDays: 7,
    description: "One placement for a week — great for a single listing push.",
    placeholder: true,
  },
  {
    id: "term",
    name: "Term Boost",
    price: 2999,
    durationDays: 30,
    description: "Home + sidebar placements for a whole month.",
    placeholder: true,
  },
  {
    id: "session",
    name: "Full Session",
    price: 7999,
    durationDays: 90,
    description: "Maximum reach across the school season.",
    placeholder: true,
  },
];

export default function AdvertisePage() {
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<AdPlan[] | null>(null);
  const [plansLive, setPlansLive] = useState(false);
  const [optBusy, setOptBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await AdvertiseApi.plans();
      if (!cancelled) {
        if (res?.data?.length) {
          setPlans(res.data);
          setPlansLive(true);
        } else {
          setPlans(PLACEHOLDER_PLANS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onOptIn = async () => {
    setOptBusy(true);
    const res = await AdvertiseApi.optIn();
    setOptBusy(false);
    if (res) {
      toast("You're in! Welcome to Gyan Hub Ads 🎉", "success");
    } else {
      toast(
        "Advertiser sign-up opens soon — we've noted your interest!",
        "info",
      );
    }
  };

  return (
    <div className="section-stack">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Gyan Hub Ads</span>
          <h1>Reach thousands of school families</h1>
          <p className="lead">
            Advertise your coaching classes, bookstore, or school services
            right where parents and students already shop. Opt in with your
            regular account — no separate login needed.
          </p>
          <div className="button-row">
            {!ready ? null : user ? (
              <button
                type="button"
                className="button button--primary"
                onClick={onOptIn}
                disabled={optBusy}
              >
                {optBusy ? "One sec…" : "Become an advertiser"}
              </button>
            ) : (
              <Link
                href="/login?next=/advertise"
                className="button button--primary"
              >
                Log in to get started
              </Link>
            )}
            <Link href="/contact" className="button button--ghost">
              Talk to us
            </Link>
          </div>
        </div>
        <aside className="hero-card">
          <span className="eyebrow">Where your ads appear</span>
          <ul className="bullet-list">
            <li>Home page banner (top)</li>
            <li>Home page spotlight (mid)</li>
            <li>Marketplace sidebar</li>
          </ul>
          <p>Simple placements, family-friendly creatives, clear reporting.</p>
        </aside>
      </section>

      <section className="section">
        <h2>Pick a plan</h2>
        {!plansLive ? (
          <p className="auth-note">
            Preview pricing — plans go live with online purchase{" "}
            <span className="badge badge--sun">Coming soon</span>
          </p>
        ) : null}
        <div className="plan-grid">
          {(plans ?? []).map((plan) => (
            <article key={plan.id} className="plan-card">
              <span className="badge">{plan.durationDays} days</span>
              <h3>{plan.name}</h3>
              <strong className="listing-price">{inr(plan.price)}</strong>
              {plan.description ? <p>{plan.description}</p> : null}
              <button
                type="button"
                className="button button--primary"
                disabled={!plansLive}
                onClick={async () => {
                  const res = await AdvertiseApi.subscribe(plan.id);
                  toast(
                    res
                      ? "Subscribed! Upload your first creative below."
                      : "Plan purchase opens soon!",
                    res ? "success" : "info",
                  );
                }}
              >
                {plansLive ? "Choose plan" : "Coming soon"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Upload creatives</h2>
        <ComingSoon
          emoji="🖼️"
          title="Creative uploads open with plans"
          body="Once plans are live you'll upload banners here (JPG/PNG, family-friendly, reviewed before serving)."
        />
      </section>
    </div>
  );
}
