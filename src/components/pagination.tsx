"use client";

import type { Pagination as PaginationInfo } from "@/lib/api/types";

type PaginationProps = {
  pagination: PaginationInfo;
  onPage(page: number): void;
};

export function Pagination({ pagination, onPage }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext } = pagination;
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (
    let p = Math.max(1, page - 2);
    p <= Math.min(totalPages, page + 2);
    p++
  ) {
    pages.push(p);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={!hasPrev} onClick={() => onPage(page - 1)}>
        ←
      </button>
      {pages[0] > 1 ? <span>…</span> : null}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages ? <span>…</span> : null}
      <button type="button" disabled={!hasNext} onClick={() => onPage(page + 1)}>
        →
      </button>
    </nav>
  );
}
