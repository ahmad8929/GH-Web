import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { featuredProducts, getProductBySlug } from "@/data/marketplace";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = featuredProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 2);

  return (
    <div className="section-stack">
      <section className="detail-grid">
        <div className="listing-hero">
          <div className="listing-gallery">{product.title}</div>
          <div className="panel">
            <span className="eyebrow">{product.portal}</span>
            <h1>{product.title}</h1>
            <p className="lead">{product.description}</p>
            <div className="meta-grid">
              <span>{product.school}</span>
              <span>{product.grade}</span>
              <span>{product.subject}</span>
              <span>{product.condition}</span>
              <span>{product.compatibility}</span>
              <span>{product.location}</span>
            </div>
          </div>
        </div>

        <aside className="listing-sidebar">
          <div className="panel">
            <span className="badge">{product.badge}</span>
            <strong className="listing-price">
              {product.price === 0 ? "Donation" : `Rs ${product.price}`}
            </strong>
            <p>{product.status}</p>
            <div className="section-stack">
              <Link href="/cart" className="button button--primary button--full">
                Add to cart
              </Link>
              <Link href="/favorites" className="button button--ghost button--full">
                Save item
              </Link>
              <Link href="/dashboard" className="button button--ghost button--full">
                Contact seller
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3>Seller information</h3>
            <p>
              {product.seller} · {product.sellerRole}
            </p>
            <p>{product.school}</p>
            <p>{product.location}</p>
          </div>
        </aside>
      </section>

      <section className="section">
        <h2>Related listings</h2>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
