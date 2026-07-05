import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Sell to Gyan Hub — books, uniforms & more",
  description:
    "Turn outgrown books and uniforms into cash. Submit your item, our team reviews it, and it goes live in the store.",
};

export default function SellPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Sell"
        title="Outgrown it? Sell it on."
        description="Submit your item with photos and your price. We pick it up, check it, and pay you — then we list it in our store."
        primaryHref="/sell/books"
        primaryLabel="Sell old books"
        secondaryHref="/sell/uniforms"
        secondaryLabel="Sell old uniforms"
      />

      <div className="cards-grid">
        <article className="feature-card">
          <span className="badge">1 · Submit</span>
          <h3>Tell us about your item</h3>
          <p>Title, condition, price, and a few photos — two minutes, tops.</p>
        </article>
        <article className="feature-card">
          <span className="badge badge--sun">2 · Review</span>
          <h3>We check it over</h3>
          <p>
            Our team reviews every submission so buyers always get quality.
          </p>
        </article>
        <article className="feature-card">
          <span className="badge badge--mint">3 · It&apos;s live!</span>
          <h3>Your item joins the store</h3>
          <p>
            Track approval and sale status any time in{" "}
            <Link href="/dashboard/submissions" className="text-link text-link--strong">
              my submissions
            </Link>
            .
          </p>
        </article>
      </div>

      <div className="portal-grid">
        <article className="portal-card">
          <span className="badge">Books</span>
          <h3>Old books</h3>
          <p>Textbooks, guides, readers — by class and subject.</p>
          <Link href="/sell/books" className="button button--primary">
            Sell books
          </Link>
        </article>
        <article className="portal-card">
          <span className="badge badge--lavender">Uniforms</span>
          <h3>Old uniforms</h3>
          <p>Outgrown sets, sized and school-tagged.</p>
          <Link href="/sell/uniforms" className="button button--primary">
            Sell uniforms
          </Link>
        </article>
        <article className="portal-card">
          <span className="badge badge--mint">Donate</span>
          <h3>Give it away</h3>
          <p>Useful things stay useful — donate instead.</p>
          <Link href="/donate" className="button button--ghost">
            Donate items
          </Link>
        </article>
      </div>
    </div>
  );
}
