"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { NotebooksApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { NotebookTemplate } from "@/lib/api/types";
import { inr } from "@/lib/format";

/**
 * Contract-first custom notebook builder. The configurator is fully
 * interactive today; ordering unlocks automatically once the backend ships
 * `/custom-notebooks/templates` (capability flag) — until then the CTA shows
 * a friendly "coming soon".
 */

const FALLBACK_TEMPLATES: NotebookTemplate[] = [
  { id: "classic", name: "Classic", basePrice: 149, description: "Clean and simple" },
  { id: "doodle", name: "Doodle Fun", basePrice: 179, description: "Playful margins" },
  { id: "galaxy", name: "Galaxy", basePrice: 199, description: "Dreamy cover art" },
];

const COVER_COLORS = [
  { id: "#3f8ed8", name: "Sky blue" },
  { id: "#ff6f61", name: "Coral" },
  { id: "#24b899", name: "Mint" },
  { id: "#8b7cf6", name: "Lavender" },
  { id: "#ffb703", name: "Sunshine" },
  { id: "#17324a", name: "Navy" },
];

const RULINGS = ["ruled", "plain", "grid", "dotted"] as const;
const BINDINGS = ["spiral", "stitched", "hardbound"] as const;
const PAGE_OPTIONS = [80, 120, 160, 200];

const DRAFT_KEY = "gh.notebook-draft";

export default function CustomNotebookPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [templates, setTemplates] = useState<NotebookTemplate[]>(FALLBACK_TEMPLATES);
  const [orderingLive, setOrderingLive] = useState(false);

  const [templateId, setTemplateId] = useState(FALLBACK_TEMPLATES[0].id);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0].id);
  const [pages, setPages] = useState(120);
  const [ruling, setRuling] = useState<(typeof RULINGS)[number]>("ruled");
  const [binding, setBinding] = useState<(typeof BINDINGS)[number]>("spiral");
  const [nameOnCover, setNameOnCover] = useState("");
  const [saved, setSaved] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Probe the contract-first endpoint; use real templates when they exist.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await NotebooksApi.templates();
      if (!cancelled && res?.data?.length) {
        setTemplates(res.data);
        setTemplateId(res.data[0].id);
        setOrderingLive(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore a saved draft from localStorage (external system, client-only).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.coverColor) setCoverColor(draft.coverColor);
      if (draft.pages) setPages(draft.pages);
      if (draft.ruling) setRuling(draft.ruling);
      if (draft.binding) setBinding(draft.binding);
      if (typeof draft.nameOnCover === "string") setNameOnCover(draft.nameOnCover);
    } catch {
      /* ignore corrupt draft */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const template = templates.find((t) => t.id === templateId) ?? templates[0];

  const price = useMemo(() => {
    let total = Number(template?.basePrice ?? 149);
    total += Math.max(0, (pages - 80) / 40) * 25;
    if (binding === "stitched") total += 20;
    if (binding === "hardbound") total += 60;
    if (nameOnCover.trim()) total += 30;
    return Math.round(total);
  }, [template, pages, binding, nameOnCover]);

  const saveDraft = () => {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ templateId, coverColor, pages, ruling, binding, nameOnCover }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const deliveryValid = contactPhone.trim() && address.trim() && city.trim();

  const placeOrder = async () => {
    if (!user) {
      router.push("/login?next=/custom-notebook");
      return;
    }
    if (!deliveryValid) {
      toast("Phone, address, and city are required to place the order", "error");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("templateId", templateId);
      form.append("coverColor", coverColor);
      form.append("ruling", ruling);
      form.append("binding", binding);
      form.append("pages", String(pages));
      if (nameOnCover.trim()) form.append("nameOnCover", nameOnCover.trim());
      form.append("price", String(price));
      if (contactName.trim()) form.append("contactName", contactName.trim());
      form.append("contactPhone", contactPhone.trim());
      form.append("address", address.trim());
      form.append("city", city.trim());
      if (pincode.trim()) form.append("pincode", pincode.trim());

      await NotebooksApi.order(form);
      window.localStorage.removeItem(DRAFT_KEY);
      setPlaced(true);
      toast("Notebook order placed. We will confirm it shortly.", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not place the order",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Custom Notebook</span>
        <h1>Design your own notebook</h1>
        <p>
          Pick a cover, ruling, and binding — and put your name on the front.
          Made to order, just for you.
        </p>
      </section>

      <div className="builder-layout">
        <aside className="notebook-preview" aria-label="Notebook preview">
          <div
            className="notebook-cover"
            style={{ background: coverColor }}
          >
            <small>{template?.name ?? "Classic"}</small>
            <strong>{nameOnCover.trim() || "Your name here"}</strong>
            <small>
              {pages} pages · {ruling} · {binding}
            </small>
          </div>
        </aside>

        <div className="section-stack">
          <section className="panel">
            <h3>1 · Template</h3>
            <div className="choice-row">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="choice-chip"
                  data-active={t.id === templateId}
                  onClick={() => setTemplateId(t.id)}
                >
                  {t.name} · {inr(t.basePrice)}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>2 · Cover color</h3>
            <div className="swatch-row">
              {COVER_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className="swatch"
                  style={{ background: color.id }}
                  data-active={color.id === coverColor}
                  aria-label={color.name}
                  title={color.name}
                  onClick={() => setCoverColor(color.id)}
                />
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>3 · Pages &amp; ruling</h3>
            <div className="choice-row">
              {PAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="choice-chip"
                  data-active={option === pages}
                  onClick={() => setPages(option)}
                >
                  {option} pages
                </button>
              ))}
            </div>
            <div className="choice-row">
              {RULINGS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="choice-chip"
                  data-active={option === ruling}
                  onClick={() => setRuling(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>4 · Binding &amp; name</h3>
            <div className="choice-row">
              {BINDINGS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="choice-chip"
                  data-active={option === binding}
                  onClick={() => setBinding(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="nb-name">Name on cover (+₹30)</label>
              <input
                id="nb-name"
                value={nameOnCover}
                maxLength={24}
                onChange={(e) => setNameOnCover(e.target.value)}
                placeholder="e.g. Aarav's Science Notes"
              />
            </div>
          </section>

          {orderingLive && !placed ? (
            <section className="panel">
              <h3>5 · Delivery details</h3>
              <div className="field">
                <label htmlFor="nb-contact-name">Your name</label>
                <input
                  id="nb-contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>
              <div className="field">
                <label htmlFor="nb-phone">Phone *</label>
                <input
                  id="nb-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="field">
                <label htmlFor="nb-address">Address *</label>
                <input
                  id="nb-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no., street, area"
                />
              </div>
              <div className="choice-row">
                <div className="field">
                  <label htmlFor="nb-city">City *</label>
                  <input
                    id="nb-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="field">
                  <label htmlFor="nb-pincode">Pincode</label>
                  <input
                    id="nb-pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="cart-summary">
            <div className="summary-row summary-row--total">
              <span>Your notebook</span>
              <strong>{inr(price)}</strong>
            </div>
            {placed ? (
              <div className="form-alert form-alert--success">
                Order placed! We will confirm it shortly. Track it from{" "}
                <Link href="/dashboard" className="text-link text-link--strong">
                  My account
                </Link>
                .
              </div>
            ) : orderingLive ? (
              <button
                type="button"
                className="button button--primary button--full"
                onClick={placeOrder}
                disabled={submitting || !deliveryValid}
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="button button--primary button--full"
                  disabled
                >
                  Ordering opens soon
                </button>
                <p className="auth-note">
                  Made-to-order notebooks are almost ready! Save your design
                  and it&apos;ll be waiting when ordering opens.{" "}
                  <span className="badge badge--sun">Coming soon</span>
                </p>
              </>
            )}
            <button
              type="button"
              className="button button--ghost button--full"
              onClick={saveDraft}
            >
              {saved ? "Saved! ✓" : "Save my design"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
