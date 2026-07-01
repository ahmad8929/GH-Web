import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { featuredProducts } from "@/data/marketplace";

const donationProducts = featuredProducts.filter(
  (product) => product.portal === "Donation",
);

export default function DonatePage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Donate"
        title="Give useful items away"
        description="Books, uniforms, bags, and kits."
        primaryHref="/signup"
        primaryLabel="Become a donor"
        secondaryHref="/sell"
        secondaryLabel="List items"
      />

      <section className="section">
        <SectionHeading
          eyebrow="How it works"
          title="Simple flow"
          description="Short and clear."
        />
        <div className="cards-grid">
          <article className="timeline-step">
            <h3>1. Add items</h3>
            <p>Describe what you are giving away, its condition, and where it can be collected.</p>
          </article>
          <article className="timeline-step">
            <h3>2. Verify route</h3>
            <p>Choose a school, NGO, or donation drive based on need, location, and item type.</p>
          </article>
          <article className="timeline-step">
            <h3>3. Deliver impact</h3>
            <p>Track approval, pickup scheduling, and handover confirmation from the dashboard.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Donation items"
          title="Ready to pass on"
          description="A few examples."
        />
        <div className="product-grid">
          {donationProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <div className="panel">
        <SectionHeading
          eyebrow="Partner access"
          title="Partners and schools"
          description="Verified groups can manage pickup."
        />
        <Link href="/admin" className="button button--primary">
          View admin controls
        </Link>
      </div>
    </div>
  );
}
