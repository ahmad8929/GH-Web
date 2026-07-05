import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "The rules for buying, selling, and donating on Gyan Hub.",
};

const termsSections = [
  {
    title: "Platform use",
    text: "Users must provide accurate information, follow school and community rules, and avoid misleading listings.",
  },
  {
    title: "Listings and transactions",
    text: "Sellers are responsible for item descriptions, pricing, and condition. Buyers should review listing details before purchase.",
  },
  {
    title: "Safety and moderation",
    text: "We may remove listings, suspend accounts, or review activity that appears fraudulent, abusive, or unsafe.",
  },
];

export default function TermsPage() {
  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Terms and conditions</span>
        <h1>Rules for using Gyan Hub.</h1>
        <p>Clear expectations for buyers, sellers, donors, and schools.</p>
      </section>

      <section className="legal-stack">
        {termsSections.map((section) => (
          <article key={section.title} className="panel">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
