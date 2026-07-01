import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/marketplace";

const textbookProducts = featuredProducts.filter(
  (product) => product.portal === "Textbooks",
);

export default function TextbooksPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Used books"
        title="Old books by class"
        description="Find books fast."
        primaryHref="/signup"
        primaryLabel="Join"
        secondaryHref="/sell/books"
        secondaryLabel="Sell books"
      />
      <div className="product-grid">
        {textbookProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
