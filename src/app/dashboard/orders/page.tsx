"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { OrdersApi } from "@/lib/api/endpoints";
import type { Order, Paginated } from "@/lib/api/types";
import { formatDate, inr } from "@/lib/format";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function OrdersPage() {
  const { user, ready } = useAuthGuard();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Order> | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show the loading state while the fetch below runs
    setState("loading");
    (async () => {
      try {
        const res = await OrdersApi.mine({ page, limit: 10 });
        if (!cancelled) {
          setData(res);
          setState("done");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, page]);

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading orders…</p>
      </div>
    );
  }

  const orders = data?.data ?? [];

  return (
    <>
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Orders</span>
        <h1>Order history</h1>
      </section>

      {state === "error" ? (
        <EmptyState
          emoji="😵"
          title="Couldn't load orders"
          body="Please try again in a moment."
        />
      ) : orders.length === 0 ? (
        <EmptyState
          emoji="📦"
          title="No orders yet"
          body="When you buy something, it shows up here."
          ctaHref="/marketplace"
          ctaLabel="Start shopping"
        />
      ) : (
        <section className="table-card">
          {orders.map((order) => (
            <div key={order.id} className="order-row">
              <div className="stack">
                <strong>{order.orderNumber}</strong>
                <span className="muted-copy">
                  {formatDate(order.createdAt)} ·{" "}
                  {(order.items ?? []).length} item
                  {(order.items ?? []).length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="status-pill" data-status={order.paymentStatus}>
                {order.paymentStatus === "unpaid"
                  ? "Pay on delivery"
                  : order.paymentStatus}
              </span>
              <strong>{inr(order.finalAmount)}</strong>
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="button button--ghost button--small"
              >
                Details
              </Link>
            </div>
          ))}
        </section>
      )}

      {data ? <Pagination pagination={data.pagination} onPage={setPage} /> : null}
    </>
  );
}
