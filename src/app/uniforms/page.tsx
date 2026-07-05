import type { Metadata } from "next";

import { Catalog } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import { getCategoryOptions, matchCategory } from "@/lib/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Uniforms — school-approved sets & sizes",
  description:
    "School uniforms by school and size — new and gently used shirts, trousers, blazers, and full sets, checked and approved.",
};

export default async function UniformsPage() {
  const categoryOptions = await getCategoryOptions();
  const category = matchCategory(categoryOptions, "uniforms");

  const initial = await safe(
    ListingsApi.list(
      { limit: 12, sort: "newest", categoryId: category?.id },
      { next: { revalidate: 60 } },
    ),
  );

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Uniforms portal"
        title="Uniforms that fit the school year"
        description="Shirts, trousers, blazers, and full sets by school and size — new and gently used."
        primaryHref="/sell/uniforms"
        primaryLabel="Sell outgrown uniforms"
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
