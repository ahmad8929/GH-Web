"use client";

import { useEffect, useMemo, useState } from "react";

import { NotebooksApi } from "@/lib/api/endpoints";
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
  const [templates, setTemplates] = useState<NotebookTemplate[]>(FALLBACK_TEMPLATES);
  const [orderingLive, setOrderingLive] = useState(false);

  const [templateId, setTemplateId] = useState(FALLBACK_TEMPLATES[0].id);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0].id);
  const [pages, setPages] = useState(120);
  const [ruling, setRuling] = useState<(typeof RULINGS)[number]>("ruled");
  const [binding, setBinding] = useState<(typeof BINDINGS)[number]>("spiral");
  const [nameOnCover, setNameOnCover] = useState("");
  const [saved, setSaved] = useState(false);

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

          <section className="cart-summary">
            <div className="summary-row summary-row--total">
              <span>Your notebook</span>
              <strong>{inr(price)}</strong>
            </div>
            {orderingLive ? (
              <button type="button" className="button button--primary button--full">
                Add to cart
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
