import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon } from "@/components/empty-state";
import { PageHero } from "@/components/page-hero";
import { BlogsApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — school life, savings & smart reuse",
  description:
    "Stories, guides, and tips from the Gyan Hub community: saving on school essentials, reuse ideas, and study inspiration.",
};

export default async function BlogsPage() {
  // Contract-first: resolves to null until the backend ships /blogs.
  const blogs = await BlogsApi.list(1);
  const posts = blogs?.data ?? [];

  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Blog"
        title="School life, smarter"
        description="Guides, savings tips, and stories from the Gyan Hub community."
        primaryHref="/marketplace"
        primaryLabel="Shop the store"
        secondaryHref="/donate"
        secondaryLabel="Donate"
      />

      {posts.length === 0 ? (
        <ComingSoon
          emoji="📰"
          title="Our blog is warming up"
          body="Fresh articles about saving on school essentials are on the way. Check back soon!"
        />
      ) : (
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
                  {post.author} · {formatDate(post.publishedAt)}
                </span>
                <h3>
                  <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="text-link text-link--strong"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
