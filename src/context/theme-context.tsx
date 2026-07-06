"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/auth-context";
import { ProfileApi } from "@/lib/api/endpoints";
import type { Theme } from "@/lib/api/types";

type ThemeContextValue = {
  /** Re-fetches the signed-in user's profile and re-applies the CSS variables. */
  refreshTheme(): Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Maps each Theme field to the design-system CSS variable(s) it drives.
const VAR_MAP: Record<
  Exclude<keyof Theme, "id" | "name" | "isActive">,
  string[]
> = {
  primaryColor: ["--primary", "--primary-strong"],
  secondaryColor: ["--secondary"],
  backgroundColor: ["--bg", "--bg-soft"],
  textColor: ["--muted"],
  headingColor: ["--text"],
  buttonBackground: ["--button-bg"],
  buttonText: ["--button-text"],
  borderColor: ["--line", "--card-border"],
  navbarColor: ["--header-bg"],
  footerColor: ["--footer-bg"],
};

function applyTheme(theme: Theme | null | undefined) {
  const root = document.documentElement.style;
  (Object.keys(VAR_MAP) as (keyof typeof VAR_MAP)[]).forEach((field) => {
    const value = theme?.[field];
    VAR_MAP[field].forEach((cssVar) => {
      if (value) root.setProperty(cssVar, value);
      else root.removeProperty(cssVar);
    });
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const lastUserId = useRef<string | null>(null);

  const refreshTheme = useCallback(async () => {
    if (!user) {
      applyTheme(null);
      return;
    }
    try {
      const res = await ProfileApi.me();
      applyTheme(res.data.profile?.theme);
    } catch {
      applyTheme(null);
    }
  }, [user]);

  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId === lastUserId.current) return;
    lastUserId.current = currentId;
    void refreshTheme();
  }, [user, refreshTheme]);

  const value = useMemo(() => ({ refreshTheme }), [refreshTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
