"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/context/favorites-context";
import { FavoritesApi } from "@/lib/api/endpoints";
import type { FavoriteApi, Paginated } from "@/lib/api/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function FavoritesPage() {
  const { user, ready } = useAuthGuard();
  const { version } = useFavorites();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<FavoriteApi> | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await FavoritesApi.list({ page, limit: 12 });
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
  }, [user, page, version]);

  if (!ready || !user || state === "loading") {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading favorites…</p>
      </div>
    );
  }

  const favorites = (data?.data ?? []).filter((f) => f.listing);

  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Favorites</span>
        <h1>Saved items</h1>
        <p>Tap the heart on any listing to keep it here.</p>
      </section>

      {state === "error" ? (
        <EmptyState
          emoji="😵"
          title="Couldn't load favorites"
          body="Please try again in a moment."
        />
      ) : favorites.length === 0 ? (
        <EmptyState
          emoji="💙"
          title="No favorites yet"
          body="Heart the things you love and find them again here."
          ctaHref="/marketplace"
          ctaLabel="Browse the store"
        />
      ) : (
        <div className="product-grid">
          {favorites.map((favorite) => (
            <ProductCard key={favorite.id} listing={favorite.listing} />
          ))}
        </div>
      )}

      {data ? <Pagination pagination={data.pagination} onPage={setPage} /> : null}
    </div>
  );
}
