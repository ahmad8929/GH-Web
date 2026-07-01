import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { featuredProducts, listingFilters } from "@/data/marketplace";

export default function MarketplacePage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Marketplace"
        title="Find school essentials"
        description="Search by school, class, category, and price."
        primaryHref="/sell"
        primaryLabel="Sell item"
        secondaryHref="/favorites"
        secondaryLabel="Saved"
      />

      <section className="panel">
        <SectionHeading
          eyebrow="Search"
          title="Browse quickly"
          description="Use a keyword or a simple filter."
        />
        <div className="market-search">
          <div className="field">
            <label htmlFor="search">Keyword</label>
            <input id="search" placeholder="Book, blazer, calculator" />
          </div>
          <div className="filters-row">
            {listingFilters.map((filter) => (
              <span key={filter} className="filter-text">
                {filter}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-stack">
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
