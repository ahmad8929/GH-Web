"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { EmptyState } from "@/components/empty-state";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { OrdersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import { inr } from "@/lib/format";
import { getPaymentProvider, paymentProviders } from "@/lib/payment";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function CheckoutPage() {
  const { user, ready } = useAuthGuard();
  const { lines, subtotal, coupon, clearCoupon, reload, loading } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !user) {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Checking your account…</p>
      </div>
    );
  }

  if (!loading && lines.length === 0 && !busy) {
    return (
      <EmptyState
        emoji="🛒"
        title="Nothing to check out"
        body="Your cart is empty — add something first."
        ctaHref="/marketplace"
        ctaLabel="Browse the store"
      />
    );
  }

  const total = coupon ? coupon.finalAmount : subtotal;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const provider = getPaymentProvider(method);
      const res = await OrdersApi.checkout({
        couponCode: coupon?.code,
        deliveryAddress: {
          name: name.trim() || user.name,
          phone: phone.trim(),
          line1: line1.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },
        deliveryNote: note.trim() || undefined,
        paymentMethod: provider.id,
      });
      const order = res.data;
      // Payment stub: order stays `unpaid`; a real gateway slots in via
      // the PaymentProvider interface without touching this flow.
      await provider.pay(order);
      clearCoupon();
      await reload();
      toast(`Order ${order.orderNumber} placed! 🎉`, "success");
      router.push(`/checkout/success/${order.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not place the order. Please try again.",
      );
      setBusy(false);
      // Cart contents may have changed (e.g. an item sold out) — refresh.
      await reload();
    }
  };

  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Checkout</span>
        <h1>Almost there!</h1>
        <p>Tell us where to deliver and how you&apos;d like to pay.</p>
      </section>

      <form className="checkout-grid" onSubmit={onSubmit}>
        <section className="checkout-section">
          <h3>Delivery details</h3>
          {error ? (
            <div className="form-alert form-alert--error">{error}</div>
          ) : null}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="co-name">Full name *</label>
              <input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user.name}
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="co-phone">Phone *</label>
              <input
                id="co-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98…"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="co-line1">Address *</label>
            <input
              id="co-line1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House, street, area"
              autoComplete="street-address"
              required
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="co-city">City *</label>
              <input
                id="co-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="co-pincode">Pincode *</label>
              <input
                id="co-pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                autoComplete="postal-code"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="co-note">Delivery note</label>
            <textarea
              id="co-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Landmark, preferred time, anything helpful (optional)"
            />
          </div>

          <h3>Payment</h3>
          <div className="stack">
            {paymentProviders.map((provider) => (
              <label key={provider.id} className="checkbox-row">
                <input
                  type="radio"
                  name="payment"
                  value={provider.id}
                  checked={method === provider.id}
                  disabled={!provider.enabled}
                  onChange={() => setMethod(provider.id)}
                />
                <span>
                  <strong>{provider.label}</strong>
                  {!provider.enabled ? (
                    <span className="badge badge--sun"> Coming soon</span>
                  ) : null}
                  <br />
                  {provider.description}
                </span>
              </label>
            ))}
          </div>
        </section>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          {lines.map((line) => (
            <div key={line.key} className="summary-row">
              <span>{line.listing.title}</span>
              <strong>{inr(line.listing.price)}</strong>
            </div>
          ))}
          {coupon ? (
            <div className="summary-row">
              <span>Coupon {coupon.code}</span>
              <strong>−{inr(coupon.discountAmount)}</strong>
            </div>
          ) : null}
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{inr(total)}</strong>
          </div>
          <button
            type="submit"
            className="button button--primary button--full"
            disabled={busy || loading}
          >
            {busy ? "Placing order…" : `Place order · ${inr(total)}`}
          </button>
          <p className="auth-note">
            You&apos;ll pay on delivery — online payments are on the way.{" "}
            <Link href="/cart">Back to cart</Link>
          </p>
        </aside>
      </form>
    </div>
  );
}
