"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdSlot } from "@/components/ad-slot";
import { EmptyState } from "@/components/empty-state";
import { OrdersApi } from "@/lib/api/endpoints";
import type { Order } from "@/lib/api/types";
import { ORDER_ITEM_STATUS_LABELS, formatDate, inr } from "@/lib/format";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function OrderConfirmationPage() {
  const { user, ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!user || !params.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await OrdersApi.byId(params.id);
        if (!cancelled) {
          setOrder(res.data);
          setState("done");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, params.id]);

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Fetching your order…</p>
      </div>
    );
  }

  if (state === "error" || !order) {
    return (
      <EmptyState
        emoji="🔍"
        title="We couldn't find that order"
        body="It may belong to a different account."
        ctaHref="/dashboard/orders"
        ctaLabel="See my orders"
      />
    );
  }

  return (
    <div className="section-stack">
      <div className="empty-state">
        <span className="empty-state__emoji" aria-hidden>
          🎉
        </span>
        <h1>Order placed!</h1>
        <p>
          <strong>{order.orderNumber}</strong> · {formatDate(order.createdAt)}
        </p>
        <span className="status-pill" data-status={order.paymentStatus}>
          Payment: {order.paymentStatus === "unpaid" ? "Pay on delivery" : order.paymentStatus}
        </span>
      </div>

      <section className="panel">
        <h3>Items</h3>
        {(order.items ?? []).map((item) => (
          <div key={item.id} className="cart-line">
            <div className="cart-line__thumb">
              {item.listing?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.listing.images[0]} alt="" />
              ) : (
                <span aria-hidden>📦</span>
              )}
            </div>
            <div className="cart-line__body">
              <strong>{item.listing?.title ?? "Item"}</strong>
              <span className="muted-copy">
                Sold by {item.seller?.name ?? "Gyan Hub"}
              </span>
            </div>
            <span className="status-pill" data-status={item.status}>
              {ORDER_ITEM_STATUS_LABELS[item.status]}
            </span>
            <strong>{inr(item.finalAmount)}</strong>
          </div>
        ))}
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{inr(order.subtotal)}</strong>
        </div>
        {Number(order.discountAmount) > 0 ? (
          <div className="summary-row">
            <span>Discount</span>
            <strong>−{inr(order.discountAmount)}</strong>
          </div>
        ) : null}
        <div className="summary-row summary-row--total">
          <span>Total</span>
          <strong>{inr(order.finalAmount)}</strong>
        </div>
      </section>

      {order.deliveryAddress ? (
        <section className="panel">
          <h3>Delivering to</h3>
          <p>
            {order.deliveryAddress.name} · {order.deliveryAddress.phone}
            <br />
            {order.deliveryAddress.line1}, {order.deliveryAddress.city}{" "}
            {order.deliveryAddress.pincode}
          </p>
          {order.deliveryNote ? <p>Note: {order.deliveryNote}</p> : null}
        </section>
      ) : null}

      <div className="button-row">
        <Link href="/dashboard/orders" className="button button--primary">
          Track my orders
        </Link>
        <Link href="/marketplace" className="button button--ghost">
          Keep shopping
        </Link>
      </div>

      <AdSlot placement="order_success" />
    </div>
  );
}
