import Link from "next/link";

import type { Product } from "@/data/marketplace";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const priceLabel = product.price === 0 ? "Donation" : `Rs ${product.price}`;

  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="badge">{product.badge}</span>
        <span className="muted-chip">{product.portal}</span>
      </div>
      <div className="product-card__visual">
        <span>{product.category}</span>
      </div>
      <div className="product-card__body">
        <div className="product-card__price-row">
          <strong>{priceLabel}</strong>
          <span>{product.condition}</span>
        </div>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <div className="meta-grid">
          <span>{product.school}</span>
          <span>{product.grade}</span>
          <span>{product.subject}</span>
          <span>{product.location}</span>
        </div>
      </div>
      <div className="product-card__footer">
        <div>
          <small>Seller</small>
          <p>
            {product.seller} · {product.sellerRole}
          </p>
        </div>
        <Link href={`/listing/${product.slug}`} className="button button--ghost">
          View
        </Link>
      </div>
    </article>
  );
}
