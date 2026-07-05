import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon } from "@/components/empty-state";
import { BlogsApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await BlogsApi.bySlug(slug);
  if (!res?.data) return { title: "Blog" };
  return {
    title: res.data.title,
    description: res.data.excerpt,
    openGraph: {
      title: res.data.title,
      description: res.data.excerpt,
      images: res.data.cover ? [res.data.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Contract-first: null until the backend ships /blogs/:slug.
  const res = await BlogsApi.bySlug(slug);
  const post = res?.data;

  if (!post) {
    return (
      <div className="section-stack">
        <ComingSoon
          emoji="📰"
          title="This article isn't ready yet"
          body="The blog is still warming up — head back to see what else is around."
        />
        <p>
          <Link href="/blogs" className="text-link text-link--strong">
            ← All articles
          </Link>
        </p>
      </div>
    );
  }

  return (
    <article className="section-stack">
      <header className="page-hero page-hero--simple">
        <span className="eyebrow">Blog</span>
        <h1>{post.title}</h1>
        <p>
          {post.author} · {formatDate(post.publishedAt)}
        </p>
      </header>

      {post.cover ? (
        <div className="blog-card__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" />
        </div>
      ) : null}

      <div
        className="panel article-body"
        // Trusted first-party CMS content per the /blogs contract.
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <p>
        <Link href="/blogs" className="text-link text-link--strong">
          ← All articles
        </Link>
      </p>
    </article>
  );
}
