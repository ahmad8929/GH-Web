import type { Metadata } from "next";

import { Catalog } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import { getCategoryOptions, matchCategory } from "@/lib/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Stationery — pens, kits & pencil-case joy",
  description:
    "Fresh stationery for school: pens, geometry boxes, files, art supplies, and study kits — all in one friendly place.",
};

export default async function StationeryPage() {
  const categoryOptions = await getCategoryOptions();
  const category = matchCategory(categoryOptions, "stationery");

  const initial = await safe(
    ListingsApi.list(
      { limit: 12, sort: "newest", categoryId: category?.id },
      { next: { revalidate: 60 } },
    ),
  );

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Stationery"
        title="Everything for the pencil case"
        description="Pens, geometry boxes, files, art supplies, and study kits — the fun part of back-to-school."
        primaryHref="/custom-notebook"
        primaryLabel="Design a custom notebook"
        secondaryHref="/marketplace"
        secondaryLabel="Browse everything"
      />
      <Catalog
        initial={initial}
        categoryOptions={categoryOptions}
        fixed={category ? { categoryId: category.id } : {}}
      />
    </div>
  );
}
