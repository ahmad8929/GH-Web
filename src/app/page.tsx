import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, featuredProducts, stats } from "@/data/marketplace";

export default function Home() {
  return (
    <div className="section-stack">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Campus reuse</span>
          <h1>School things, shared smarter.</h1>
          <p className="lead">Books, uniforms, stationery, bags, and devices.</p>
          <div className="button-row">
            <Link href="/marketplace" className="button button--primary">
              Shop
            </Link>
            <Link href="/sell/books" className="button button--ghost">
              Sell books
            </Link>
          </div>
          <div className="stat-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="hero-card">
          <span className="eyebrow">Start here</span>
          <h3>Quick paths for the busiest categories.</h3>
          <ul className="bullet-list">
            <li>Used books</li>
            <li>Used uniforms</li>
            <li>Donation items</li>
            <li>Fast local search</li>
          </ul>
          <div className="hero-card__strip">
            <div>
              <strong>4</strong>
              <span>roles</span>
            </div>
            <div>
              <strong>15+</strong>
              <span>groups</span>
            </div>
            <div>
              <strong>3</strong>
              <span>portals</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="categories">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by type"
          description="Short. Clear. Fast."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="category-card"
              data-tone={category.accent}
            >
              <span className="icon-pill">{category.count}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <Link
                href={
                  category.slug === "textbooks"
                    ? "/textbooks"
                    : category.slug === "uniforms"
                      ? "/uniforms"
                      : category.slug === "donation"
                        ? "/donate"
                        : "/marketplace"
                }
                className="text-link"
              >
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Popular"
          title="Useful shortcuts"
          description="Made for repeat needs."
        />
        <div className="portal-grid">
          <article className="portal-card">
            <span className="badge">Market</span>
            <h3>All items</h3>
            <p>Search everything.</p>
            <Link href="/marketplace" className="button button--ghost">
              Open
            </Link>
          </article>
          <article className="portal-card">
            <span className="badge">Old books</span>
            <h3>Sell used books</h3>
            <p>By class and subject.</p>
            <Link href="/sell/books" className="button button--ghost">
              Sell
            </Link>
          </article>
          <article className="portal-card">
            <span className="badge">Old uniforms</span>
            <h3>Sell used uniforms</h3>
            <p>By school and size.</p>
            <Link href="/sell/uniforms" className="button button--ghost">
              Sell
            </Link>
          </article>
          <article className="portal-card">
            <span className="badge">Donate</span>
            <h3>Give items away</h3>
            <p>Useful things stay useful.</p>
            <Link href="/donate" className="button button--ghost">
              Donate
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Fresh listings"
          title="New in the market"
          description="A few live examples."
        />
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="story-grid">
          <article className="panel">
            <SectionHeading
              eyebrow="Our goal"
              title="Make school essentials more affordable"
              description="We help families save money by making reuse simple, safe, and local."
            />
            <p className="muted-copy">
              Books, uniforms, bags, and study tools should not be bought new every year if they are still useful.
            </p>
          </article>
          <article className="panel">
            <SectionHeading
              eyebrow="About us"
              title="Built for students and parents"
              description="Gyan Hub connects school communities for buying, selling, and donation."
            />
            <p className="muted-copy">
              Our focus is trust, easy search, and less waste across the academic year.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
