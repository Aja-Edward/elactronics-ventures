import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * News and blog share one model, split by `type`.
 *
 * The two have separate listings — /news and /blog — because the reference
 * site lists them separately and readers arrive looking for one or the other.
 * They now have separate article routes too, /news/[slug] and /blog/[slug],
 * so a piece is read at the address its section implies.
 *
 * That trades away the property the shared route had: a post no longer keeps
 * its URL when an editor reclassifies it. The admin covers the gap by writing
 * a redirect on a type change exactly as it does on a slug rename, so the old
 * address keeps resolving. Slugs stay unique across both kinds, so the two
 * routes can never collide.
 */

export type PostKind = "NEWS" | "BLOG";

/**
 * Where a post lives. Type decides the section, so every link to a post goes
 * through here rather than assembling a path and getting it wrong for one kind.
 */
export function postPath(post: { slug: string; type: PostKind }): string {
  return post.type === "BLOG" ? `/blog/${post.slug}` : `/news/${post.slug}`;
}

/** The wording each section uses for itself, so the two routes stay in step. */
export const POST_SECTION: Record<
  PostKind,
  { label: string; indexHref: string; backLabel: string }
> = {
  NEWS: { label: "News", indexHref: "/news", backLabel: "All news" },
  BLOG: { label: "Blog", indexHref: "/blog", backLabel: "All articles" },
};

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

/**
 * One published post, optionally restricted to a kind.
 *
 * The routes pass their own kind, so /news/<slug> cannot serve a blog article
 * and vice versa. Without that both addresses would render every post and the
 * same piece would sit at two URLs.
 */
export async function getPostBySlug(slug: string, type?: PostKind) {
  "use cache";
  cacheTag(tags.posts(), tags.post(slug));
  cacheLife("days");

  return db.post.findFirst({
    where: { slug, status: "PUBLISHED", ...(type ? { type } : {}) },
    select: {
      id: true, slug: true, title: true, excerpt: true, body: true, type: true,
      author: true, tags: true, publishedAt: true,
      seoTitle: true, seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}

/** Slugs for generateStaticParams, per section. */
export async function getPostSlugs(type?: PostKind) {
  "use cache";
  cacheTag(tags.posts());
  cacheLife("days");
  const rows = await db.post.findMany({
    where: { status: "PUBLISHED", ...(type ? { type } : {}) },
    select: { slug: true },
  });
  return rows.map((r: { slug: string }) => r.slug);
}

/** Consistent, locale-stable date rendering for listings and articles. */
export function formatPostDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
