import type { Metadata } from "next";

import { ListingForm } from "@/components/listing-form";
import { PageHero } from "@/components/page-hero";
import { getCategoryOptions } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Sell old books",
  description:
    "Sell your used textbooks, guides, and readers to Gyan Hub — submit in minutes, reviewed by our team, live in the store.",
};

export default async function SellBooksPage() {
  const categoryOptions = await getCategoryOptions();

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell books"
        title="Give your books a second reader"
        description="Class, subject, board, condition, price — and photos help a lot."
        primaryHref="/dashboard/submissions"
        primaryLabel="My submissions"
        secondaryHref="/sell"
        secondaryLabel="Other selling options"
      />
      <ListingForm
        listingType="sale"
        categoryHint="book"
        categoryOptions={categoryOptions}
        heading="Sell your old books"
        intro="Fill this in and hit submit — our team reviews it before it goes live."
      />
    </div>
  );
}
