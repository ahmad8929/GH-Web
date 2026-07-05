"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AuthApi } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/api/http";
import type { AuthUser, UserType } from "@/lib/api/types";

type AuthContextValue = {
  user: AuthUser | null;
  /** false until the stored session has been checked once */
  ready: boolean;
  login(email: string, password: string): Promise<AuthUser>;
  register(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    userType?: UserType;
  }): Promise<AuthUser>;
  logout(): void;
  refreshUser(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "gh.user";

function readCachedUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const persistUser = useCallback((next: AuthUser | null) => {
    setUser(next);
    if (next) window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(USER_KEY);
  }, []);

  // Restore the session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.access && !tokenStore.refresh) {
        setReady(true);
        return;
      }
      const cached = readCachedUser();
      if (cached) setUser(cached);
      try {
        const res = await AuthApi.me();
        if (!cancelled) persistUser(res.data);
      } catch {
        // api() already attempted a refresh; session is truly dead.
        if (!cancelled) {
          tokenStore.clear();
          persistUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistUser]);

  // The http layer fires this when a refresh attempt fails.
  useEffect(() => {
    const onUnauthorized = () => persistUser(null);
    window.addEventListener("gh:unauthorized", onUnauthorized);
    return () => window.removeEventListener("gh:unauthorized", onUnauthorized);
  }, [persistUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await AuthApi.login(email, password);
      tokenStore.set({ access: res.accessToken, refresh: res.refreshToken });
      persistUser(res.data);
      return res.data;
    },
    [persistUser],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      userType?: UserType;
    }) => {
      const res = await AuthApi.register(input);
      tokenStore.set({ access: res.accessToken, refresh: res.refreshToken });
      persistUser(res.data);
      return res.data;
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    persistUser(null);
  }, [persistUser]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await AuthApi.me();
      persistUser(res.data);
    } catch {
      /* keep current state */
    }
  }, [persistUser]);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, refreshUser }),
    [user, ready, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
