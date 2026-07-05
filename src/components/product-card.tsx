"use client";

import Link from "next/link";

import { FavoriteButton } from "@/components/favorite-button";
import type { Listing } from "@/lib/api/types";
import { CONDITION_LABELS, LISTING_TYPE_LABELS, inr } from "@/lib/format";
import { listingPath } from "@/lib/slug";

type ProductCardProps = {
  listing: Listing;
};

export function ProductCard({ listing }: ProductCardProps) {
  const href = listingPath(listing);
  const typeBadgeClass =
    listing.listingType === "donate"
      ? "badge badge--mint"
      : listing.listingType === "exchange"
        ? "badge badge--lavender"
        : "badge";

  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className={typeBadgeClass}>
          {LISTING_TYPE_LABELS[listing.listingType]}
        </span>
        <span className="muted-chip">{CONDITION_LABELS[listing.condition]}</span>
      </div>

      <div className="product-card__visual">
        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary/user images, unoptimized by design
          <img src={listing.images[0]} alt={listing.title} loading="lazy" />
        ) : null}
        {listing.category?.name ? <span>{listing.category.name}</span> : null}
        <FavoriteButton listingId={listing.id} />
      </div>

      <div className="product-card__body">
        <div className="product-card__price-row">
          <strong>
            {inr(listing.price)}{" "}
            {listing.originalPrice &&
            Number(listing.originalPrice) > Number(listing.price ?? 0) ? (
              <span className="price-strike">{inr(listing.originalPrice)}</span>
            ) : null}
          </strong>
          {listing.isFeatured ? (
            <span className="badge badge--sun">★ Featured</span>
          ) : null}
        </div>
        <h3>
          <Link href={href}>{listing.title}</Link>
        </h3>
        <div className="meta-grid">
          {listing.grade ? <span>{listing.grade}</span> : null}
          {listing.subject ? <span>{listing.subject}</span> : null}
          {listing.school?.name ? <span>{listing.school.name}</span> : null}
          {listing.city ? <span>{listing.city}</span> : null}
        </div>
      </div>

      <div className="product-card__footer">
        <div>
          <small>Seller</small>
          <p>{listing.seller?.name ?? "Gyan Hub"}</p>
        </div>
        <Link href={href} className="button button--ghost button--small">
          View
        </Link>
      </div>
    </article>
  );
}
