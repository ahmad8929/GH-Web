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

import { useAuth } from "@/context/auth-context";
import { FavoritesApi } from "@/lib/api/endpoints";

type ToggleResult = "added" | "removed" | "auth-required";

type FavoritesContextValue = {
  ids: ReadonlySet<string>;
  isFavorite(listingId: string): boolean;
  toggle(listingId: string): Promise<ToggleResult>;
  /** bump when favorites change so list pages can refetch */
  version: number;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when the session (external system) ends
      setIds(new Set());
      return;
    }
    (async () => {
      try {
        const res = await FavoritesApi.list({ limit: 100 });
        if (!cancelled) {
          setIds(new Set(res.data.map((favorite) => favorite.listingId)));
        }
      } catch {
        if (!cancelled) setIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  const isFavorite = useCallback(
    (listingId: string) => ids.has(listingId),
    [ids],
  );

  const toggle = useCallback(
    async (listingId: string): Promise<ToggleResult> => {
      if (!user) return "auth-required";
      const res = await FavoritesApi.toggle(listingId);
      setIds((current) => {
        const next = new Set(current);
        if (res.data.favorited) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
      setVersion((v) => v + 1);
      return res.data.favorited ? "added" : "removed";
    },
    [user],
  );

  const value = useMemo(
    () => ({ ids, isFavorite, toggle, version }),
    [ids, isFavorite, toggle, version],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return ctx;
}
