import { PageHero } from "@/components/page-hero";

export default function SellPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell"
        title="Choose a selling flow"
        description="Pick the right page first."
        primaryHref="/sell/books"
        primaryLabel="Sell old books"
        secondaryHref="/sell/uniforms"
        secondaryLabel="Sell old uniforms"
      />

      <div className="cards-grid">
        <article className="feature-card">
          <span className="badge">Books</span>
          <h3>Used books</h3>
          <p>Class, subject, board, price.</p>
        </article>
        <article className="feature-card">
          <span className="badge">Uniforms</span>
          <h3>Used uniforms</h3>
          <p>School, size, set, price.</p>
        </article>
        <article className="feature-card">
          <span className="badge">Donate</span>
          <h3>Free items</h3>
          <p>Pass reusable items on.</p>
        </article>
      </div>
    </div>
  );
}
