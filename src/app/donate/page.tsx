import type { Metadata } from "next";

import { ListingForm } from "@/components/listing-form";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { getCategoryOptions } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Donate school items",
  description:
    "Donate books, uniforms, bags, and school kits through Gyan Hub — reviewed, matched, and passed on to students who need them.",
};

export default async function DonatePage() {
  const categoryOptions = await getCategoryOptions();

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Donate"
        title="Give useful items a second life"
        description="Books, uniforms, bags, and kits — donate what you've outgrown, we pick it up and give it a second life in the store."
        primaryHref="#donate-form"
        primaryLabel="Donate an item"
        secondaryHref="/sell"
        secondaryLabel="Sell instead"
      />

      <section className="section">
        <SectionHeading
          eyebrow="How it works"
          title="Three easy steps"
          description="From your shelf to someone's school bag."
        />
        <div className="cards-grid">
          <article className="timeline-step">
            <h3>1 · Add your item</h3>
            <p>
              Describe what you&apos;re giving away, its condition, and where
              it can be collected.
            </p>
          </article>
          <article className="timeline-step">
            <h3>2 · We review &amp; collect</h3>
            <p>
              The Gyan Hub team checks each donation and arranges a pickup from
              your address.
            </p>
          </article>
          <article className="timeline-step">
            <h3>3 · It gets a second life</h3>
            <p>
              We list it in the store from our end, so your item goes on to
              another student.
            </p>
          </article>
        </div>
      </section>

      <section id="donate-form" className="section">
        <ListingForm
          listingType="donate"
          categoryOptions={categoryOptions}
          heading="Donate an item"
          intro="No payment — just tell us what it is, its condition, and where we can pick it up."
        />
      </section>
    </div>
  );
}
