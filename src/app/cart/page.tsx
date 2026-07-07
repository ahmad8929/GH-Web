"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AdSlot } from "@/components/ad-slot";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/context/auth-context";
import { useCart, type CartLine } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";
import { CONDITION_LABELS, inr } from "@/lib/format";
import { listingPath } from "@/lib/slug";

function CartLineRow({ line }: { line: CartLine }) {
  const { remove } = useCart();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const onRemove = async () => {
    setBusy(true);
    try {
      await remove(line);
      toast("Removed from cart", "info");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not remove item",
        "error",
      );
      setBusy(false);
    }
  };

  const { listing } = line;
  return (
    <div className="cart-line">
      <div className="cart-line__thumb">
        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.images[0]} alt="" />
        ) : (
          <span aria-hidden>📚</span>
        )}
      </div>
      <div className="cart-line__body">
        <strong>
          <Link href={listingPath(listing)}>{listing.title}</Link>
        </strong>
        <span className="muted-copy">
          {CONDITION_LABELS[listing.condition]}
          {listing.grade ? ` · ${listing.grade}` : ""}
          {listing.city ? ` · ${listing.city}` : ""}
        </span>
      </div>
      <strong>{inr(listing.price)}</strong>
      <button
        type="button"
        className="button button--ghost button--small"
        onClick={onRemove}
        disabled={busy}
      >
        {busy ? "…" : "Remove"}
      </button>
    </div>
  );
}

export default function CartPage() {
  const { user } = useAuth();
  const { lines, subtotal, loading, coupon, applyCoupon, clearCoupon, clear } =
    useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const onApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!user) {
      router.push("/login?next=/cart");
      return;
    }
    setCouponBusy(true);
    try {
      const result = await applyCoupon(code.trim());
      toast(`Coupon ${result.code} applied — you save ${inr(result.discountAmount)}!`, "success");
    } catch (err) {
      setCouponError(
        err instanceof ApiError ? err.message : "Could not validate coupon.",
      );
    } finally {
      setCouponBusy(false);
    }
  };

  const onCheckout = () => {
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const total = coupon ? coupon.finalAmount : subtotal;

  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Cart</span>
        <h1>Your cart</h1>
        <p>
          School items here are one-of-a-kind — each listing is a single item,
          so there are no quantities to juggle.
        </p>
      </section>

      <AdSlot placement="cart" />

      {loading ? (
        <div className="panel" aria-busy>
          <div className="spinner" />
          <p>Loading your cart…</p>
        </div>
      ) : lines.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          body="Browse the marketplace and grab something great before it's gone."
          ctaHref="/marketplace"
          ctaLabel="Start shopping"
        />
      ) : (
        <div className="cart-layout">
          <section className="panel">
            {lines.map((line) => (
              <CartLineRow key={line.key} line={line} />
            ))}
            <div className="button-row button-row--spaced">
              <Link href="/marketplace" className="button button--ghost button--small">
                Keep shopping
              </Link>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => void clear()}
              >
                Clear cart
              </button>
            </div>
          </section>

          <aside className="cart-summary">
            <h3>Order summary</h3>

            {user ? (
              coupon ? (
                <div className="form-alert form-alert--success">
                  Coupon <strong>{coupon.code}</strong> applied (−
                  {inr(coupon.discountAmount)}){" "}
                  <button
                    type="button"
                    className="text-link text-link--strong"
                    onClick={() => {
                      clearCoupon();
                      setCode("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-row" onSubmit={onApplyCoupon}>
                  <input
                    aria-label="Coupon code"
                    placeholder="Coupon code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="button button--ghost"
                    disabled={couponBusy || !code.trim()}
                  >
                    {couponBusy ? "…" : "Apply"}
                  </button>
                </form>
              )
            ) : (
              <p className="auth-note">
                <Link href="/login?next=/cart" className="text-link text-link--strong">
                  Log in
                </Link>{" "}
                to apply coupons and check out.
              </p>
            )}
            {couponError ? (
              <div className="form-alert form-alert--error">{couponError}</div>
            ) : null}

            <div className="summary-row">
              <span>
                Subtotal ({lines.length} item{lines.length === 1 ? "" : "s"})
              </span>
              <strong>{inr(subtotal)}</strong>
            </div>
            {coupon ? (
              <div className="summary-row">
                <span>Discount</span>
                <strong>−{inr(coupon.discountAmount)}</strong>
              </div>
            ) : null}
            <div className="summary-row">
              <span>Delivery</span>
              <strong>Free</strong>
            </div>
            <div className="summary-row summary-row--total">
              <span>Total</span>
              <strong>{inr(total)}</strong>
            </div>

            <button
              type="button"
              className="button button--primary button--full"
              onClick={onCheckout}
            >
              {user ? "Checkout" : "Log in to checkout"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
