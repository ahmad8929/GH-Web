import { PageHero } from "@/components/page-hero";

export default function CheckoutPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Checkout"
        title="Clean checkout"
        description="Short, clear, and easy."
        primaryHref="/login"
        primaryLabel="Login"
        secondaryHref="/cart"
        secondaryLabel="Back"
      />

      <div className="checkout-grid">
        <section className="checkout-section">
          <h3>Contact information</h3>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" placeholder="Parent or student name" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" placeholder="+91 98..." />
          </div>
          <div className="field">
            <label htmlFor="address">Pickup or delivery notes</label>
            <textarea id="address" placeholder="Preferred pickup window or address" />
          </div>
        </section>

        <section className="checkout-section">
          <h3>Payment summary</h3>
          <div className="summary-row">
            <span>Items total</span>
            <strong>Rs 3240</strong>
          </div>
          <div className="summary-row">
            <span>Protection fee</span>
            <strong>Rs 49</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>Rs 3289</strong>
          </div>
          <button type="button" className="button button--primary button--full">
            Place order
          </button>
        </section>
      </div>
    </div>
  );
}
