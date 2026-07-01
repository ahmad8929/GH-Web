import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/marketplace";

const uniformProducts = featuredProducts.filter(
  (product) => product.portal === "Uniforms",
);

export default function UniformsPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Used uniforms"
        title="Old uniforms by school"
        description="Find the right set fast."
        primaryHref="/sell/uniforms"
        primaryLabel="Sell uniforms"
        secondaryHref="/schools"
        secondaryLabel="Schools"
      />
      <div className="product-grid">
        {uniformProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
