"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { useToast } from "@/context/toast-context";
import { SellbackApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { Paginated, SellbackRequest } from "@/lib/api/types";
import { formatDate, inr } from "@/lib/format";
import { listingPath } from "@/lib/slug";
import { useAuthGuard } from "@/lib/use-auth-guard";

const CANCELLABLE: SellbackRequest["status"][] = [
  "pending",
  "approved",
  "pickup_scheduled",
];

export default function SubmissionsPage() {
  const { user, ready } = useAuthGuard();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<SellbackRequest> | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await SellbackApi.mine({ page, limit: 10 });
      setData(res);
      setState("done");
    } catch {
      setState("error");
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() syncs from the API and sets a loading flag first
    if (user) void load();
  }, [user, load]);

  const onCancel = async (request: SellbackRequest) => {
    if (!window.confirm(`Withdraw "${request.title}"?`)) return;
    try {
      await SellbackApi.cancel(request.id);
      toast("Request withdrawn", "info");
      void load();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not withdraw request",
        "error",
      );
    }
  };

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading submissions…</p>
      </div>
    );
  }

  const requests = data?.data ?? [];

  return (
    <>
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Sell &amp; donate</span>
        <h1>My submissions</h1>
        <p>
          Items you&apos;ve sent our way. We review each one, pick it up, and
          list it in the store from our end.
        </p>
        <div className="button-row">
          <Link href="/sell" className="button button--primary">
            Sell something
          </Link>
          <Link href="/donate" className="button button--ghost">
            Donate
          </Link>
        </div>
      </section>

      {state === "error" ? (
        <EmptyState
          emoji="😵"
          title="Couldn't load submissions"
          body="Please try again in a moment."
        />
      ) : requests.length === 0 ? (
        <EmptyState
          emoji="📮"
          title="Nothing submitted yet"
          body="Outgrown books or uniforms? Send them our way — sell or donate in minutes."
          ctaHref="/sell"
          ctaLabel="Submit an item"
        />
      ) : (
        <section className="table-card">
          {requests.map((req) => {
            const price = req.agreedPrice ?? req.expectedPrice;
            return (
              <div key={req.id} className="order-row">
                <div className="stack">
                  <strong>
                    {req.resultListing ? (
                      <Link href={listingPath(req.resultListing)}>
                        {req.title}
                      </Link>
                    ) : (
                      req.title
                    )}
                  </strong>
                  <span className="muted-copy">
                    {req.kind === "sell" ? "Sell" : "Donate"}
                    {req.kind === "sell" && price ? ` · ${inr(price)}` : ""} ·{" "}
                    {formatDate(req.createdAt)}
                    {req.status === "rejected" && req.rejectionReason
                      ? ` · Reason: ${req.rejectionReason}`
                      : ""}
                  </span>
                </div>
                <span className="status-pill" data-status={req.status}>
                  {req.status.replace(/_/g, " ")}
                </span>
                <span className="muted-copy">
                  {req.resultListing ? "Listed in store" : ""}
                </span>
                {CANCELLABLE.includes(req.status) ? (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => onCancel(req)}
                  >
                    Withdraw
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </section>
      )}

      {data ? <Pagination pagination={data.pagination} onPage={setPage} /> : null}
    </>
  );
}
