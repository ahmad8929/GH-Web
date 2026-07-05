"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/context/toast-context";
import { OrdersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { Order, OrderItem } from "@/lib/api/types";
import {
  CANCELLABLE_STATUSES,
  ORDER_ITEM_STATUS_LABELS,
  formatDate,
  inr,
} from "@/lib/format";
import { useAuthGuard } from "@/lib/use-auth-guard";

function OrderItemRow({
  item,
  onCancelled,
}: {
  item: OrderItem;
  onCancelled(): void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const cancellable = CANCELLABLE_STATUSES.includes(item.status);

  const onCancel = async () => {
    if (!window.confirm("Cancel this item? This can't be undone.")) return;
    setBusy(true);
    try {
      await OrdersApi.cancelItem(item.id);
      toast("Item cancelled", "success");
      onCancelled();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not cancel item",
        "error",
      );
      setBusy(false);
    }
  };

  return (
    <div className="cart-line">
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
          {item.cancelReason ? ` · Reason: ${item.cancelReason}` : ""}
        </span>
      </div>
      <span className="status-pill" data-status={item.status}>
        {ORDER_ITEM_STATUS_LABELS[item.status]}
      </span>
      <strong>{inr(item.finalAmount)}</strong>
      {cancellable ? (
        <button
          type="button"
          className="button button--danger button--small"
          onClick={onCancel}
          disabled={busy}
        >
          {busy ? "…" : "Cancel"}
        </button>
      ) : null}
    </div>
  );
}

export default function OrderDetailPage() {
  const { user, ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  const load = useCallback(async () => {
    try {
      const res = await OrdersApi.byId(params.id);
      setOrder(res.data);
      setState("done");
    } catch {
      setState("error");
    }
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() syncs order state from the API
    if (user && params.id) void load();
  }, [user, params.id, load]);

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading order…</p>
      </div>
    );
  }

  if (state === "error" || !order) {
    return (
      <EmptyState
        emoji="🔍"
        title="Order not found"
        ctaHref="/dashboard/orders"
        ctaLabel="Back to orders"
      />
    );
  }

  return (
    <>
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Order</span>
        <h1>{order.orderNumber}</h1>
        <p>
          Placed {formatDate(order.createdAt)} ·{" "}
          <span className="status-pill" data-status={order.paymentStatus}>
            {order.paymentStatus === "unpaid"
              ? "Pay on delivery"
              : order.paymentStatus}
          </span>
        </p>
      </section>

      <section className="panel">
        <h3>Items</h3>
        {(order.items ?? []).map((item) => (
          <OrderItemRow key={item.id} item={item} onCancelled={load} />
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
          <h3>Delivery address</h3>
          <p>
            {order.deliveryAddress.name} · {order.deliveryAddress.phone}
            <br />
            {order.deliveryAddress.line1}, {order.deliveryAddress.city}{" "}
            {order.deliveryAddress.pincode}
          </p>
          {order.deliveryNote ? <p>Note: {order.deliveryNote}</p> : null}
        </section>
      ) : null}

      <p>
        <Link href="/dashboard/orders" className="text-link text-link--strong">
          ← All orders
        </Link>
      </p>
    </>
  );
}
