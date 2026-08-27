import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * News and blog share one model, split by `type`. They are presented together
 * under /news: on a site this size, separating them would give two thin,
 * near-empty listings rather than one useful one.
 */

export async function getPublishedPosts() {
  "use cache";
  cacheTag(tags.posts());
  cacheLife("days");

  return db.post.findMany({
    where: { status: "PUBLISHED" },
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
  return rows.map((r) => r.slug);
}

/** Consistent, locale-stable date rendering for listings and articles. */
export function formatPostDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
