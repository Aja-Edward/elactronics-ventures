import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import ArticlePage from "@/components/site/ArticlePage";
import { getPostBySlug, getPostSlugs } from "@/lib/news";
import { findRedirect } from "@/lib/redirects";

/**
 * A blog article.
 *
 * The mirror of /news/[slug], scoped to BLOG. Both fetch from the same model
 * and render the same component; only the kind and the section wording differ.
 */

// Reads params, which is per-request data.
export const instant = false;

/**
 * Sentinel when empty — Cache Components requires at least one entry, and the
 * blog is empty today, so without it the build would fail outright.
 */
export async function generateStaticParams() {
  const slugs = await getPostSlugs("BLOG");
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "BLOG");
  if (!post) return { title: "Not found", robots: { index: false } };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.heroImage
        ? [{ url: post.heroImage.secureUrl, alt: post.heroImage.alt ?? "" }]
        : undefined,
    },
  };
}

export default async function BlogArticleRoute({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "BLOG");

  if (!post) {
    const moved = await findRedirect(`/blog/${slug}`);
    if (moved) permanentRedirect(moved.destination);
    notFound();
  }

  return <ArticlePage post={post} />;
}
