import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/marketplace";

export default function FavoritesPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Saved items"
        title="Your shortlist"
        description="Keep products you want to revisit."
        primaryHref="/marketplace"
        primaryLabel="Browse more"
        secondaryHref="/cart"
        secondaryLabel="Go to cart"
      />
      <div className="product-grid">
        {featuredProducts.slice(0, 3).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
