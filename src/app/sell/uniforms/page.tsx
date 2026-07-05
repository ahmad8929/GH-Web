import type { Metadata } from "next";

import { ListingForm } from "@/components/listing-form";
import { PageHero } from "@/components/page-hero";
import { getCategoryOptions } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Sell old uniforms",
  description:
    "Sell outgrown school uniforms on Gyan Hub — school, size, set, and price. Reviewed by our team before going live.",
};

export default async function SellUniformsPage() {
  const categoryOptions = await getCategoryOptions();

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell uniforms"
        title="Outgrown uniforms deserve a next term"
        description="School, size, what's in the set, condition, and price."
        primaryHref="/dashboard/submissions"
        primaryLabel="My submissions"
        secondaryHref="/sell"
        secondaryLabel="Other selling options"
      />
      <ListingForm
        listingType="sale"
        categoryHint="uniform"
        categoryOptions={categoryOptions}
        heading="Sell your old uniforms"
        intro="Use the subject/size field for sizing (e.g. 'M size' or 'Age 10-11')."
      />
    </div>
  );
}
