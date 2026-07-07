import type { Metadata } from "next";

import { AdSlot } from "@/components/ad-slot";
import { Catalog } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import { getCategoryOptions, matchCategory } from "@/lib/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Old Books — pre-loved textbooks & readers",
  description:
    "Quality used textbooks, guides, and readers by class and subject — checked, approved, and priced to save families money.",
};

export default async function TextbooksPage() {
  const categoryOptions = await getCategoryOptions();
  const category = matchCategory(categoryOptions, "old-books");

  const initial = await safe(
    ListingsApi.list(
      { limit: 12, sort: "newest", categoryId: category?.id },
      { next: { revalidate: 60 } },
    ),
  );

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Old Books portal"
        title="Pre-loved books, big savings"
        description="Textbooks, guides, and readers by class and subject — every copy checked before it's listed."
        primaryHref="/sell/books"
        primaryLabel="Sell your old books"
        secondaryHref="/marketplace"
        secondaryLabel="Browse everything"
      />
      <AdSlot placement="category" />
      <Catalog
        initial={initial}
        categoryOptions={categoryOptions}
        fixed={category ? { categoryId: category.id } : {}}
      />
    </div>
  );
}
