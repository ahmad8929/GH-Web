"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useThemeContext } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { ProfileApi, ThemeApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { Theme } from "@/lib/api/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

function ThemePreviewCard({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md, 0.5rem)",
        overflow: "hidden",
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      <div
        style={{
          background: theme.navbarColor,
          padding: "0.5rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: theme.headingColor,
        }}
      >
        Gyan Hub
      </div>
      <div style={{ background: theme.backgroundColor, padding: "0.75rem" }}>
        <p style={{ color: theme.headingColor, fontWeight: 700, margin: 0 }}>
          Sample heading
        </p>
        <p
          style={{
            color: theme.textColor,
            fontSize: "0.85rem",
            margin: "0.25rem 0 0.6rem",
          }}
        >
          This is how body text will look across the site.
        </p>
        <span
          style={{
            display: "inline-block",
            background: theme.buttonBackground,
            color: theme.buttonText,
            padding: "0.35rem 0.8rem",
            borderRadius: "var(--radius-sm, 0.35rem)",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Sample button
        </span>
      </div>
      <div
        style={{
          background: theme.footerColor,
          padding: "0.4rem 0.75rem",
          fontSize: "0.7rem",
          color: "#fff",
        }}
      >
        Footer
      </div>
    </div>
  );
}

export default function ThemePage() {
  const { user, ready } = useAuthGuard();
  const { toast } = useToast();
  const { refreshTheme } = useThemeContext();
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const [themesRes, profileRes] = await Promise.all([
          ThemeApi.list(),
          ProfileApi.me(),
        ]);
        if (cancelled) return;
        setThemes(themesRes.data);
        setSelectedId(profileRes.data.profile?.theme?.id ?? null);
        setState("done");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onApply = async (theme: Theme) => {
    setBusyId(theme.id);
    try {
      await ProfileApi.selectTheme(theme.id);
      setSelectedId(theme.id);
      await refreshTheme();
      toast(`"${theme.name}" applied`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not apply theme",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  const onReset = async () => {
    setBusyId("default");
    try {
      await ProfileApi.selectTheme(null);
      setSelectedId(null);
      await refreshTheme();
      toast("Reset to default look", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not reset theme",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading themes…</p>
      </div>
    );
  }

  return (
    <>
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Personalize</span>
        <h1>Choose your theme</h1>
        <p>
          Pick a color theme for your Gyan Hub experience. It applies
          instantly and only changes how the site looks for you.
        </p>
        <div className="button-row">
          <button
            type="button"
            className="button button--ghost"
            onClick={onReset}
            disabled={!selectedId || busyId !== null}
          >
            {busyId === "default" ? "Resetting…" : "Use default look"}
          </button>
        </div>
      </section>

      {state === "error" ? (
        <EmptyState
          emoji="😵"
          title="Couldn't load themes"
          body="Please try again in a moment."
        />
      ) : (themes ?? []).length === 0 ? (
        <EmptyState
          emoji="🎨"
          title="No themes available yet"
          body="Check back soon for new looks."
        />
      ) : (
        <section className="plan-grid">
          {(themes ?? []).map((theme) => {
            const active = selectedId === theme.id;
            return (
              <article key={theme.id} className="plan-card">
                <h3>{theme.name}</h3>
                <ThemePreviewCard theme={theme} />
                <button
                  type="button"
                  className={
                    active ? "button button--ghost" : "button button--primary"
                  }
                  onClick={() => onApply(theme)}
                  disabled={active || busyId !== null}
                  style={{ marginTop: "var(--space-3)" }}
                >
                  {busyId === theme.id
                    ? "Applying…"
                    : active
                      ? "Selected"
                      : "Apply theme"}
                </button>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
