import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export default function SellBooksPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell old books"
        title="List used books fast"
        description="Add class, subject, board, and price."
        primaryHref="/signup"
        primaryLabel="Start listing"
        secondaryHref="/textbooks"
        secondaryLabel="View books"
      />

      <section className="panel">
        <SectionHeading
          eyebrow="Book form"
          title="Simple book details"
          description="Short and clear."
        />
        <div className="form-grid">
          <div className="field">
            <label htmlFor="book-title">Title</label>
            <input id="book-title" placeholder="Class 9 Maths Set" />
          </div>
          <div className="field">
            <label htmlFor="book-grade">Class</label>
            <input id="book-grade" placeholder="Grade 9" />
          </div>
          <div className="field">
            <label htmlFor="book-subject">Subject</label>
            <input id="book-subject" placeholder="Maths" />
          </div>
          <div className="field">
            <label htmlFor="book-price">Price</label>
            <input id="book-price" placeholder="650" />
          </div>
        </div>
      </section>
    </div>
  );
}
