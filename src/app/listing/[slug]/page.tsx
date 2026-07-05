import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import type { Listing } from "@/lib/api/types";
import {
  CONDITION_LABELS,
  LISTING_TYPE_LABELS,
  formatDate,
  inr,
} from "@/lib/format";
import { listingIdFromSlug, slugify } from "@/lib/slug";

export const revalidate = 60;
export const dynamicParams = true;

/** Pre-render the freshest listings; anything else renders on demand. */
export async function generateStaticParams() {
  const res = await safe(ListingsApi.list({ limit: 24, sort: "newest" }));
  if (!res) return [];
  return res.data.map((listing) => ({
    slug: `${slugify(listing.title)}-${listing.id}`,
  }));
}

async function getListing(slug: string): Promise<Listing | null> {
  const id = listingIdFromSlug(slug);
  const res = await safe(ListingsApi.byId(id, { next: { revalidate: 60 } }));
  return res?.data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Listing not found" };
  const description =
    listing.description?.slice(0, 155) ||
    `${listing.title} — ${CONDITION_LABELS[listing.condition]}, ${inr(listing.price)} on Gyan Hub.`;
  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.images[0] ? [listing.images[0]] : undefined,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const related = await safe(
    ListingsApi.list(
      {
        limit: 3,
        categoryId: listing.categoryId ?? undefined,
        sort: "newest",
      },
      { next: { revalidate: 120 } },
    ),
  );
  const relatedListings = (related?.data ?? [])
    .filter((item) => item.id !== listing.id)
    .slice(0, 3);

  const discount =
    listing.originalPrice &&
    Number(listing.originalPrice) > Number(listing.price ?? 0)
      ? Math.round(
          (1 - Number(listing.price ?? 0) / Number(listing.originalPrice)) *
            100,
        )
      : null;

  return (
    <div className="section-stack">
      <section className="detail-grid">
        <div className="listing-hero">
          <Gallery
            images={listing.images}
            title={listing.title}
            placeholderEmoji="📚"
          />
          <div className="panel">
            <span className="eyebrow">
              {listing.category?.name ?? "School essentials"}
            </span>
            <h1>{listing.title}</h1>
            {listing.description ? (
              <p className="lead">{listing.description}</p>
            ) : null}
            <div className="meta-grid">
              <span>Condition: {CONDITION_LABELS[listing.condition]}</span>
              <span>{LISTING_TYPE_LABELS[listing.listingType]}</span>
              {listing.grade ? <span>Class: {listing.grade}</span> : null}
              {listing.subject ? <span>Subject: {listing.subject}</span> : null}
              {listing.school?.name ? (
                <span>School: {listing.school.name}</span>
              ) : null}
              {listing.city ? <span>Location: {listing.city}</span> : null}
              <span>Listed: {formatDate(listing.createdAt)}</span>
              <span>Views: {listing.viewCount}</span>
            </div>
          </div>
        </div>

        <aside className="listing-sidebar">
          <div className="panel">
            <div className="product-card__top">
              {listing.isFeatured ? (
                <span className="badge badge--sun">★ Featured</span>
              ) : (
                <span className="badge">
                  {LISTING_TYPE_LABELS[listing.listingType]}
                </span>
              )}
              <FavoriteButton listingId={listing.id} />
            </div>
            <strong className="listing-price">
              {inr(listing.price)}{" "}
              {discount ? (
                <span className="price-strike">{inr(listing.originalPrice)}</span>
              ) : null}
            </strong>
            {discount ? (
              <span className="badge badge--mint">{discount}% off</span>
            ) : null}
            <div className="section-stack">
              <AddToCartButton listing={listing} full />
              <Link href="/cart" className="button button--ghost button--full">
                Go to cart
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3>Seller</h3>
            <p>{listing.seller?.name ?? "Gyan Hub"}</p>
            {listing.city ? (
              <p>
                {listing.city}
                {listing.pincode ? ` · ${listing.pincode}` : ""}
              </p>
            ) : null}
            <p className="auth-note">
              Every listing is reviewed and approved by the Gyan Hub team
              before it goes live.
            </p>
          </div>
        </aside>
      </section>

      {relatedListings.length ? (
        <section className="section">
          <h2>You might also like</h2>
          <div className="product-grid">
            {relatedListings.map((item) => (
              <ProductCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p>
        <Link href="/marketplace" className="text-link text-link--strong">
          ← Back to the marketplace
        </Link>
      </p>
    </div>
  );
}
