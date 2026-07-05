import type { Metadata } from "next";

import { Catalog } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import { getCategoryOptions, matchCategory } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Marketplace — books, uniforms, stationery & more",
  description:
    "Browse the full Gyan Hub catalog: old and new books, uniforms, stationery, and donated school essentials. Search, filter, and save.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;
  const categoryOptions = await getCategoryOptions();

  // `?cat=` deep-links (e.g. New Books from the nav) preselect a category.
  const preset = cat ? matchCategory(categoryOptions, cat) : undefined;

  const initial = await safe(
    ListingsApi.list(
      {
        limit: 12,
        sort: "newest",
        categoryId: preset?.id,
        search: q || undefined,
      },
      { next: { revalidate: 60 } },
    ),
  );

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Marketplace"
        title="Find school essentials"
        description="Search and filter the live catalog — every item checked and approved by our team."
        primaryHref="/sell"
        primaryLabel="Sell an item"
        secondaryHref="/donate"
        secondaryLabel="Donate"
      />
      <Catalog
        initial={initial}
        categoryOptions={categoryOptions}
        initialFilters={{
          categoryId: preset?.id ?? "",
          search: q ?? "",
        }}
      />
    </div>
  );
}
