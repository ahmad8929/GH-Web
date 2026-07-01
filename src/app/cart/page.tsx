import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { featuredProducts } from "@/data/marketplace";

const cartItems = featuredProducts.slice(0, 3);

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Cart"
        title="Review your items"
        description="Check products before checkout."
        primaryHref="/checkout"
        primaryLabel="Checkout"
        secondaryHref="/marketplace"
        secondaryLabel="Keep shopping"
      />

      <div className="cart-layout">
        <section className="panel">
          {cartItems.map((item) => (
            <div key={item.slug} className="cart-line">
              <div className="stack">
                <strong>{item.title}</strong>
                <span className="muted-copy">
                  {item.school} | {item.grade} | {item.condition}
                </span>
              </div>
              <strong>{item.price === 0 ? "Donation" : `Rs ${item.price}`}</strong>
            </div>
          ))}
        </section>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>Rs {subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Platform fee</span>
            <strong>Rs 49</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>Rs {subtotal + 49}</strong>
          </div>
          <Link href="/checkout" className="button button--primary button--full">
            Continue
          </Link>
        </aside>
      </div>
    </div>
  );
}
