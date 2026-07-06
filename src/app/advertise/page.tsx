"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Modal } from "@/components/modal";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { AdvertiseApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { AdPlan, AdSubscription } from "@/lib/api/types";
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

const STEPS = ["Payment", "Ad submitted", "Under review", "Live"] as const;

function stepIndex(ad: AdSubscription["ad"]): number {
  if (!ad) return 1; // paid, waiting on a creative
  if (ad.status === "approved") return 4;
  return 3; // pending or rejected both sit at "under review" on the happy path
}

function ProgressBar({ startsAt, endsAt }: { startsAt?: string | null; endsAt?: string | null }) {
  if (!startsAt || !endsAt) return null;
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const pct = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="auth-note">
        {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Ended"}
      </p>
    </div>
  );
}

function AdStepper({ ad }: { ad: AdSubscription["ad"] }) {
  const current = stepIndex(ad);
  const rejected = ad?.status === "rejected";
  return (
    <div className="ad-stepper">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current || (step === current && !rejected);
        const isCurrent = step === current;
        return (
          <div
            key={label}
            className={`ad-stepper__step ${done ? "ad-stepper__step--done" : ""} ${isCurrent && rejected ? "ad-stepper__step--rejected" : ""}`}
          >
            <span className="ad-stepper__dot" />
            <span>{isCurrent && rejected ? "Rejected" : label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AdForm({
  subscription,
  onDone,
}: {
  subscription: AdSubscription;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const existing = subscription.ad;
  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Please give your ad a title.");
      return;
    }
    if (!existing && !file) {
      setError("Please upload a creative image.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("subscriptionId", subscription.id);
      if (businessName.trim()) form.append("businessName", businessName.trim());
      form.append("title", title.trim());
      if (description.trim()) form.append("description", description.trim());
      if (targetUrl.trim()) form.append("targetUrl", targetUrl.trim());
      if (contactPhone.trim()) form.append("contactPhone", contactPhone.trim());
      if (contactEmail.trim()) form.append("contactEmail", contactEmail.trim());
      if (file) form.append("image", file);

      const res = await AdvertiseApi.createAd(form);
      if (res) {
        toast("Ad submitted for review — we'll notify you once it's live.", "success");
        onDone();
      } else {
        toast("Ad submission opens soon!", "info");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel" onSubmit={onSubmit} style={{ marginTop: "var(--space-3)" }}>
      {error ? <div className="form-alert form-alert--error">{error}</div> : null}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="ad-business">Business / brand name</label>
          <input
            id="ad-business"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sharma Tuition Classes"
          />
        </div>
        <div className="field">
          <label htmlFor="ad-title">Ad title *</label>
          <input
            id="ad-title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best Math Tuition in Town"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="ad-desc">Description</label>
          <textarea
            id="ad-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you teach / sell? Who is it for?"
          />
        </div>
        <div className="field">
          <label htmlFor="ad-url">Where should a click go?</label>
          <input
            id="ad-url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://wa.me/91… or your website"
          />
        </div>
        <div className="field">
          <label htmlFor="ad-phone">Contact phone</label>
          <input
            id="ad-phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="For our review team, if we need to reach you"
          />
        </div>
        <div className="field">
          <label htmlFor="ad-email">Contact email</label>
          <input
            id="ad-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ad-image">Creative image {existing ? "" : "*"}</label>
          <input
            ref={fileInput}
            id="ad-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="auth-note">
            Landscape images work best (about 1200×300px) — tall or square
            photos may get cropped in the banner slot.
          </p>
          {existing ? (
            <p className="auth-note">Leave blank to keep your current image.</p>
          ) : null}
        </div>
      </div>
      <p className="auth-note">
        Placement (home top, home mid, or sidebar) is assigned by our review
        team based on availability — not something you choose here.
      </p>
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? "Submitting…" : existing ? "Resubmit for review" : "Submit ad for review"}
      </button>
    </form>
  );
}

function SubscriptionCard({
  subscription,
  onRefresh,
}: {
  subscription: AdSubscription;
  onRefresh: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const ad = subscription.ad;
  const placementLabels: Record<string, string> = {
    home_top: "Home page banner (top)",
    home_mid: "Home page spotlight (mid)",
    sidebar: "Marketplace sidebar",
  };

  return (
    <div className="panel">
      <div className="button-row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>{subscription.plan?.name ?? "Ad plan"}</strong>
          <p className="auth-note">
            {subscription.amountPaid ? `${inr(subscription.amountPaid)} paid` : null}
          </p>
        </div>
        {ad ? (
          <span
            className={`badge ${ad.status === "approved" ? "badge--mint" : ad.status === "rejected" ? "badge--coral" : "badge--sun"}`}
          >
            {ad.status === "approved" ? "Live" : ad.status === "rejected" ? "Rejected" : "Under review"}
          </span>
        ) : (
          <span className="badge badge--sun">Needs a creative</span>
        )}
      </div>

      <AdStepper ad={ad} />
      <ProgressBar startsAt={subscription.startsAt} endsAt={subscription.endsAt} />

      {ad ? (
        <button
          type="button"
          className="panel"
          onClick={() => setDetailsOpen(true)}
          style={{
            display: "flex",
            gap: "var(--space-3)",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            font: "inherit",
            color: "inherit",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image}
            alt={ad.title}
            style={{ width: "6rem", height: "4rem", objectFit: "cover", borderRadius: "var(--radius-md, 0.5rem)", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <strong>{ad.title}</strong>
            {ad.businessName ? <p className="auth-note">{ad.businessName}</p> : null}
            {ad.description ? <p className="auth-note">{ad.description}</p> : null}
            {ad.link ? (
              <p className="auth-note" style={{ overflowWrap: "break-word" }}>
                {ad.link}
              </p>
            ) : null}
          </div>
        </button>
      ) : null}

      {ad ? (
        <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Ad details">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image}
            alt={ad.title}
            style={{ width: "100%", maxHeight: "12rem", objectFit: "cover", borderRadius: "var(--radius-md, 0.5rem)" }}
          />
          <div className="section-stack" style={{ marginTop: "var(--space-3)" }}>
            {[
              ["Title", ad.title],
              ["Business / brand", ad.businessName || "—"],
              ["Description", ad.description || "—"],
              ["Target URL", ad.link || "—"],
              ["Placement", placementLabels[ad.position] ?? ad.position],
              ["Contact phone", ad.contactPhone || "—"],
              ["Contact email", ad.contactEmail || "—"],
              ["Status", ad.status],
              ...(ad.status === "rejected" ? [["Rejection reason", ad.rejectionReason || "—"]] : []),
              ["Submitted", new Date(ad.createdAt).toLocaleString()],
              ["Plan", subscription.plan?.name ?? "—"],
              ["Amount paid", subscription.amountPaid ? inr(subscription.amountPaid) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="summary-row">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {ad?.status === "rejected" && ad.rejectionReason ? (
        <p className="form-alert form-alert--error">{ad.rejectionReason}</p>
      ) : null}

      {!ad || ad.status === "rejected" ? (
        formOpen ? (
          <AdForm
            subscription={subscription}
            onDone={() => {
              setFormOpen(false);
              onRefresh();
            }}
          />
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={() => setFormOpen(true)}
          >
            {ad ? "Edit & resubmit" : "Create your ad"}
          </button>
        )
      ) : ad.status === "approved" ? (
        <p className="auth-note">
          Your ad is live. Want changes? Contact us and we'll help.
        </p>
      ) : (
        <p className="auth-note">
          Your ad is under review — we'll notify you once it's approved.
        </p>
      )}
    </div>
  );
}

export default function AdvertisePage() {
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<AdPlan[] | null>(null);
  const [plansLive, setPlansLive] = useState(false);
  const [optBusy, setOptBusy] = useState(false);
  const [subscriptions, setSubscriptions] = useState<AdSubscription[]>([]);

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

  const refreshSubscriptions = async () => {
    if (!user) return;
    const res = await AdvertiseApi.mySubscriptions();
    setSubscriptions(res?.data ?? []);
  };

  useEffect(() => {
    if (user) void refreshSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const ownedPlanIds = new Set(subscriptions.map((s) => s.planId));

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
          {(plans ?? []).map((plan) => {
            const owned = ownedPlanIds.has(plan.id);
            return (
              <article key={plan.id} className="plan-card">
                <span className="badge">{plan.durationDays} days</span>
                <h3>{plan.name}</h3>
                <strong className="listing-price">{inr(plan.price)}</strong>
                {plan.description ? <p>{plan.description}</p> : null}
                {owned ? (
                  <button type="button" className="button button--ghost" disabled>
                    Already purchased
                  </button>
                ) : plansLive ? (
                  <Link href={`/advertise/checkout/${plan.id}`} className="button button--primary">
                    Choose plan
                  </Link>
                ) : (
                  <button type="button" className="button button--primary" disabled>
                    Coming soon
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {user && subscriptions.length > 0 ? (
        <section className="section">
          <h2>Your ads</h2>
          <div className="section-stack">
            {subscriptions.map((s) => (
              <SubscriptionCard key={s.id} subscription={s} onRefresh={refreshSubscriptions} />
            ))}
          </div>
        </section>
      ) : (
        <section className="section">
          <h2>Upload creatives</h2>
          <p className="auth-note">
            Choose a plan above to unlock your ad slot — you'll create your ad
            right here once your plan is active.
          </p>
        </section>
      )}
    </div>
  );
}
