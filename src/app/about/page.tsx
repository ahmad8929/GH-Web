import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">About us</span>
        <h1>Built to reduce cost and waste in school communities.</h1>
        <p>
          Gyan Hub helps families buy, sell, and donate school essentials in a
          safer and simpler way.
        </p>
      </section>

      <div className="story-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="Mission"
            title="Make school essentials easier to access"
            description="We want good items to stay in use longer."
          />
          <p className="muted-copy">
            Textbooks, uniforms, bags, and learning tools should circulate
            inside local school networks instead of being wasted.
          </p>
        </article>
        <article className="panel">
          <SectionHeading
            eyebrow="What we do"
            title="Connect buyers, sellers, and donors"
            description="One platform for resale and donation."
          />
          <p className="muted-copy">
            We focus on trust, clear listing details, and fast discovery by
            school, class, and category.
          </p>
        </article>
      </div>
    </div>
  );
}
