import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export default function SellUniformsPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell old uniforms"
        title="List used uniforms fast"
        description="Add school, size, condition, and price."
        primaryHref="/signup"
        primaryLabel="Start listing"
        secondaryHref="/uniforms"
        secondaryLabel="View uniforms"
      />

      <section className="panel">
        <SectionHeading
          eyebrow="Uniform form"
          title="Simple uniform details"
          description="Short and clean."
        />
        <div className="form-grid">
          <div className="field">
            <label htmlFor="uniform-title">Title</label>
            <input id="uniform-title" placeholder="Boys blazer set" />
          </div>
          <div className="field">
            <label htmlFor="uniform-school">School</label>
            <input id="uniform-school" placeholder="St. Xavier's School" />
          </div>
          <div className="field">
            <label htmlFor="uniform-size">Size</label>
            <input id="uniform-size" placeholder="Age 12-13" />
          </div>
          <div className="field">
            <label htmlFor="uniform-price">Price</label>
            <input id="uniform-price" placeholder="1400" />
          </div>
        </div>
      </section>
    </div>
  );
}
