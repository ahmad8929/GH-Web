"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { ListingsApi } from "@/lib/api/endpoints";
import type {
  CategoryRef,
  Condition,
  Listing,
  ListingQuery,
  ListingType,
  Paginated,
} from "@/lib/api/types";
import { CONDITION_LABELS } from "@/lib/format";

const PAGE_SIZE = 12;

type CatalogProps = {
  /** first page fetched on the server for SEO; null when API was down */
  initial: Paginated<Listing> | null;
  /** filters locked by the page (e.g. category portals) — hidden from the UI */
  fixed?: Partial<ListingQuery>;
  /** real categories derived from listings; empty hides the category select */
  categoryOptions?: CategoryRef[];
  /** initial user-tweakable filter state (e.g. from URL params) */
  initialFilters?: Partial<Filters>;
};

type Filters = {
  search: string;
  categoryId: string;
  condition: "" | Condition;
  listingType: "" | ListingType;
  minPrice: string;
  maxPrice: string;
  sort: NonNullable<ListingQuery["sort"]>;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  categoryId: "",
  condition: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

export function Catalog({
  initial,
  fixed = {},
  categoryOptions = [],
  initialFilters = {},
}: CatalogProps) {
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Listing> | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRender = useRef(true);
  const requestSeq = useRef(0);

  const query = useMemo<ListingQuery>(
    () => ({
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
      condition: filters.condition || undefined,
      listingType: filters.listingType || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      sort: filters.sort,
      page,
      limit: PAGE_SIZE,
      ...fixed,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed is a stable page-level literal
    [filters, page],
  );

  const load = useCallback(async (q: ListingQuery) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await ListingsApi.list(q);
      if (seq === requestSeq.current) setData(res);
    } catch {
      if (seq === requestSeq.current) {
        setError("We couldn't load listings right now. Please try again.");
      }
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  // Refetch when filters/page change (debounced for typing in search).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (initial) return; // server already gave us page 1
    }
    const t = window.setTimeout(() => load(query), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const listings = data?.data ?? [];
  const showCategory = !fixed.categoryId && categoryOptions.length > 0;
  const showType = !fixed.listingType;
  const showCondition = !fixed.condition;

  return (
    <div className="section-stack">
      <div className="panel">
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="catalog-search">Search</label>
            <input
              id="catalog-search"
              type="search"
              placeholder="Book, blazer, geometry box…"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
            />
          </div>

          {showCategory ? (
            <div className="field">
              <label htmlFor="catalog-category">Category</label>
              <select
                id="catalog-category"
                value={filters.categoryId}
                onChange={(e) => setFilter("categoryId", e.target.value)}
              >
                <option value="">All</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showCondition ? (
            <div className="field">
              <label htmlFor="catalog-condition">Condition</label>
              <select
                id="catalog-condition"
                value={filters.condition}
                onChange={(e) =>
                  setFilter("condition", e.target.value as Filters["condition"])
                }
              >
                <option value="">Any</option>
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showType ? (
            <div className="field">
              <label htmlFor="catalog-type">Type</label>
              <select
                id="catalog-type"
                value={filters.listingType}
                onChange={(e) =>
                  setFilter(
                    "listingType",
                    e.target.value as Filters["listingType"],
                  )
                }
              >
                <option value="">All</option>
                <option value="sale">For sale</option>
                <option value="donate">Free / donation</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="catalog-min">Min ₹</label>
            <input
              id="catalog-min"
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilter("minPrice", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="catalog-max">Max ₹</label>
            <input
              id="catalog-max"
              type="number"
              min={0}
              placeholder="5000"
              value={filters.maxPrice}
              onChange={(e) => setFilter("maxPrice", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="catalog-sort">Sort</label>
            <select
              id="catalog-sort"
              value={filters.sort}
              onChange={(e) =>
                setFilter("sort", e.target.value as Filters["sort"])
              }
            >
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="catalog-meta">
        <span className="filter-text">
          {loading
            ? "Loading…"
            : data
              ? `${data.pagination.total} item${data.pagination.total === 1 ? "" : "s"} found`
              : ""}
        </span>
      </div>

      {loading && !listings.length ? (
        <div className="skeleton-grid" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          emoji="😵"
          title="Something went wrong"
          body={error}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No items match yet"
          body="Try clearing a filter, or check back soon — new items arrive all the time."
        />
      ) : (
        <div className="product-grid">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {data ? <Pagination pagination={data.pagination} onPage={setPage} /> : null}
    </div>
  );
}
