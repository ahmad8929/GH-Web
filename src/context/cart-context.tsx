"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/auth-context";
import { CartApi, CouponsApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { CouponValidation, Listing } from "@/lib/api/types";
import { clampQuantity, lineTotalFor } from "@/lib/pricing";

/**
 * Cart model notes:
 * - Most listings are unique physical items (quantity is always 1). Corporate
 *   bulk listings (`listing.isBulk`) are restockable and carry a real
 *   quantity, clamped to the listing's MOQ/stock — see `lib/pricing.ts`.
 * - Guests keep a local cart (listing snapshots + quantity in localStorage);
 *   it is merged into the server cart right after login/signup.
 */

export type CartLine = {
  key: string;
  /** present only for server-backed lines */
  serverId?: string;
  listing: Listing;
  quantity: number;
};

type GuestCartEntry = { listing: Listing; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  subtotal: number;
  count: number;
  loading: boolean;
  coupon: CouponValidation | null;
  inCart(listingId: string): boolean;
  add(listing: Listing, quantity?: number): Promise<void>;
  setQuantity(line: CartLine, quantity: number): Promise<void>;
  remove(line: CartLine): Promise<void>;
  clear(): Promise<void>;
  applyCoupon(code: string): Promise<CouponValidation>;
  clearCoupon(): void;
  /** re-fetch the server cart (e.g. after checkout) */
  reload(): Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_KEY = "gh.cart";

function readGuestCart(): GuestCartEntry[] {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (Listing | GuestCartEntry)[];
    return parsed.map((entry) =>
      "listing" in entry
        ? entry
        : { listing: entry, quantity: clampQuantity(entry, 1) },
    );
  } catch {
    return [];
  }
}

function writeGuestCart(entries: GuestCartEntry[]) {
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(entries));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const mergedForUser = useRef<string | null>(null);

  const loadServerCart = useCallback(async () => {
    const res = await CartApi.get();
    setLines(
      res.data.items.map((item) => ({
        key: item.id,
        serverId: item.id,
        listing: item.listing,
        quantity: item.quantity,
      })),
    );
  }, []);

  const loadGuestCart = useCallback(() => {
    setLines(
      readGuestCart().map(({ listing, quantity }) => ({
        key: `local:${listing.id}`,
        listing,
        quantity,
      })),
    );
  }, []);

  // Load / merge whenever the signed-in user changes.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCoupon(null);
      try {
        if (user) {
          const guest = readGuestCart();
          if (guest.length && mergedForUser.current !== user.id) {
            mergedForUser.current = user.id;
            for (const { listing, quantity } of guest) {
              try {
                await CartApi.add(listing.id, quantity);
              } catch {
                // already in cart / own listing / no longer available
              }
            }
            writeGuestCart([]);
          }
          if (!cancelled) await loadServerCart();
        } else {
          mergedForUser.current = null;
          loadGuestCart();
        }
      } catch {
        if (!cancelled) setLines([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready, loadServerCart, loadGuestCart]);

  const inCart = useCallback(
    (listingId: string) => lines.some((line) => line.listing.id === listingId),
    [lines],
  );

  const add = useCallback(
    async (listing: Listing, quantity?: number) => {
      setCoupon(null);
      const qty = clampQuantity(listing, quantity ?? listing.moq ?? 1);
      if (user) {
        try {
          await CartApi.add(listing.id, qty);
        } catch (err) {
          // Treat "already in cart" as success so the UI stays friendly.
          if (!(err instanceof ApiError && err.status === 409)) throw err;
        }
        await loadServerCart();
      } else {
        const guest = readGuestCart();
        const existing = guest.find((item) => item.listing.id === listing.id);
        const next = existing
          ? guest.map((item) =>
              item.listing.id === listing.id
                ? { listing, quantity: clampQuantity(listing, item.quantity + qty) }
                : item,
            )
          : [...guest, { listing, quantity: qty }];
        writeGuestCart(next);
        loadGuestCart();
      }
    },
    [user, loadServerCart, loadGuestCart],
  );

  const setQuantity = useCallback(
    async (line: CartLine, quantity: number) => {
      setCoupon(null);
      if (line.serverId) {
        await CartApi.setQuantity(line.serverId, quantity);
        await loadServerCart();
      } else {
        const next =
          quantity <= 0
            ? readGuestCart().filter((item) => item.listing.id !== line.listing.id)
            : readGuestCart().map((item) =>
                item.listing.id === line.listing.id
                  ? { listing: item.listing, quantity: clampQuantity(item.listing, quantity) }
                  : item,
              );
        writeGuestCart(next);
        loadGuestCart();
      }
    },
    [loadServerCart, loadGuestCart],
  );

  const remove = useCallback(
    async (line: CartLine) => {
      setCoupon(null);
      if (line.serverId) {
        await CartApi.removeItem(line.serverId);
        await loadServerCart();
      } else {
        writeGuestCart(
          readGuestCart().filter((item) => item.listing.id !== line.listing.id),
        );
        loadGuestCart();
      }
    },
    [loadServerCart, loadGuestCart],
  );

  const clear = useCallback(async () => {
    setCoupon(null);
    if (user) {
      await CartApi.clear();
      await loadServerCart();
    } else {
      writeGuestCart([]);
      loadGuestCart();
    }
  }, [user, loadServerCart, loadGuestCart]);

  const applyCoupon = useCallback(async (code: string) => {
    const res = await CouponsApi.validate(code);
    setCoupon(res.data);
    return res.data;
  }, []);

  const clearCoupon = useCallback(() => setCoupon(null), []);

  const reload = useCallback(async () => {
    setCoupon(null);
    if (user) {
      try {
        await loadServerCart();
      } catch {
        setLines([]);
      }
    } else {
      loadGuestCart();
    }
  }, [user, loadServerCart, loadGuestCart]);

  const subtotal = useMemo(
    () =>
      Math.round(
        lines.reduce(
          (sum, line) => sum + lineTotalFor(line.listing, line.quantity),
          0,
        ) * 100,
      ) / 100,
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      subtotal,
      count: lines.length,
      loading,
      coupon,
      inCart,
      add,
      setQuantity,
      remove,
      clear,
      applyCoupon,
      clearCoupon,
      reload,
    }),
    [
      lines,
      subtotal,
      loading,
      coupon,
      inCart,
      add,
      setQuantity,
      remove,
      clear,
      applyCoupon,
      clearCoupon,
      reload,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
