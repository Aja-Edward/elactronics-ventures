import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * News and blog share one model, split by `type`.
 *
 * The two have separate listings — /news and /blog — because the reference
 * site lists them separately and readers arrive looking for one or the other.
 * They still share the article route at /news/[slug]: one model, one slug
 * space, so a post keeps its URL if an editor reclassifies it.
 */

export type PostKind = "NEWS" | "BLOG";

export async function getPublishedPosts(type?: PostKind) {
  "use cache";
  cacheTag(tags.posts());
  cacheLife("days");

  return db.post.findMany({
    where: { status: "PUBLISHED", ...(type ? { type } : {}) },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, title: true, excerpt: true, type: true,
      author: true, tags: true, publishedAt: true, isFeatured: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheTag(tags.posts(), tags.post(slug));
  cacheLife("days");

  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, excerpt: true, body: true, type: true,
      author: true, tags: true, publishedAt: true,
      seoTitle: true, seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getPostSlugs() {
  "use cache";
  cacheTag(tags.posts());
  cacheLife("days");
  const rows = await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return rows.map((r: { slug: string }) => r.slug);
}

/** Consistent, locale-stable date rendering for listings and articles. */
export function formatPostDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
