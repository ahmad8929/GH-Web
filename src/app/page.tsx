import Link from "next/link";

import { AdSlot } from "@/components/ad-slot";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { BlogsApi, ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import { SHOP_CATEGORIES } from "@/lib/categories";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function Home() {
  // Live data, fetched in parallel; every call degrades to null gracefully.
  const [featuredRes, newestRes, blogsRes] = await Promise.all([
    safe(
      ListingsApi.list(
        { sort: "featured", limit: 3 },
        { next: { revalidate: 60 } },
      ),
    ),
    safe(
      ListingsApi.list(
        { sort: "newest", limit: 6 },
        { next: { revalidate: 60 } },
      ),
    ),
    BlogsApi.list(1),
  ]);

  const newest = newestRes?.data ?? [];
  const featuredOnly = (featuredRes?.data ?? []).filter((l) => l.isFeatured);
  const posts = (blogsRes?.data ?? []).slice(0, 3);

  return (
    <div className="section-stack">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">The friendly school store</span>
          <h1>School things, shared smarter.</h1>
          <p className="lead">
            Old books, new books, uniforms, stationery, and custom notebooks —
            checked, approved, and priced for families.
          </p>
          <div className="button-row">
            <Link href="/marketplace" className="button button--primary">
              Shop the store
            </Link>
            <Link href="/sell" className="button button--sun">
              Sell your items
            </Link>
            <Link href="/donate" className="button button--ghost">
              Donate
            </Link>
          </div>
        </div>

        <aside className="hero-card">
          <span className="eyebrow">Why Gyan Hub?</span>
          <h3>Every item is checked before it goes live.</h3>
          <ul className="bullet-list">
            <li>Quality-checked used books &amp; uniforms</li>
            <li>Sell back or donate in minutes</li>
            <li>Made-to-order custom notebooks</li>
          </ul>
          <div className="hero-card__strip">
            <div>
              <strong>5</strong>
              <span>shop categories</span>
            </div>
            <div>
              <strong>1</strong>
              <span>friendly account</span>
            </div>
            <div>
              <strong>0</strong>
              <span>wasted books</span>
            </div>
          </div>
        </aside>
      </section>

      <AdSlot placement="home_top" />

      <section className="section" id="categories">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by type"
          description="Five ways in — pick yours."
        />
        <div className="category-grid">
          {SHOP_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className="category-card"
              data-tone={category.tone}
            >
              <span className="category-card__emoji" aria-hidden>
                {category.emoji}
              </span>
              <h3>{category.label}</h3>
              <p>{category.blurb}</p>
              <span className="text-link text-link--strong">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredOnly.length ? (
        <section className="section">
          <SectionHeading
            eyebrow="Featured"
            title="Staff picks"
            description="Hand-picked highlights from the store."
          />
          <div className="product-grid">
            {featuredOnly.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ) : null}

      <AdSlot placement="home_mid" />

      <section className="section">
        <SectionHeading
          eyebrow="Fresh in"
          title="New in the store"
          description="The latest approved arrivals."
        />
        {newest.length ? (
          <div className="product-grid">
            {newest.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="The shelves are being stocked"
            body="New items land here as soon as they're approved — check back in a bit!"
            ctaHref="/sell"
            ctaLabel="Be the first to sell"
          />
        )}
      </section>

      {posts.length ? (
        <section className="section">
          <SectionHeading
            eyebrow="From the blog"
            title="School life, smarter"
            description="Tips, guides, and community stories."
          />
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card__cover">
                  {post.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden>📚</span>
                  )}
                </div>
                <div className="blog-card__body">
                  <span className="filter-text">
                    {formatDate(post.publishedAt)}
                  </span>
                  <h3>
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p>{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="story-grid">
          <article className="panel">
            <SectionHeading
              eyebrow="Sell &amp; donate"
              title="Outgrown things find new homes"
              description="Submit used books and uniforms — we review, list, and handle the rest."
            />
            <div className="button-row">
              <Link href="/sell" className="button button--primary">
                Start selling
              </Link>
              <Link href="/donate" className="button button--ghost">
                Donate instead
              </Link>
            </div>
          </article>
          <article className="panel">
            <SectionHeading
              eyebrow="Custom notebooks"
              title="A notebook that's all yours"
              description="Pick the cover, ruling, and binding — and put your name on the front."
            />
            <div className="button-row">
              <Link href="/custom-notebook" className="button button--sun">
                Start designing
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
