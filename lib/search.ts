import { db } from "./db";

/**
 * Site search across published content.
 *
 * Deliberately NOT cached: the cache key would be the query string, which is
 * unbounded, so caching would fill storage with entries nobody reads again.
 * Search is inherently a dynamic read.
 *
 * This is a straightforward case-insensitive substring match. It is honest
 * about what it is — good enough for a site of this size, where the corpus is
 * a few dozen records. If the catalogue grows into the thousands, this should
 * become a Postgres full-text index rather than more LIKE clauses.
 */

export type SearchHit = {
  id: string;
  title: string;
  excerpt: string | null;
  href: string;
  kind: "Division" | "Equipment" | "Project" | "News" | "Certification";
};

const MAX_PER_KIND = 6;

export async function searchSite(rawQuery: string): Promise<SearchHit[]> {
  const q = rawQuery.trim();

  // A one-character query matches nearly everything and is never a real
  // search; treat it as no query at all.
  if (q.length < 2) return [];

  const like = { contains: q, mode: "insensitive" as const };

  const [divisions, equipment, projects, posts, certifications] = await Promise.all([
    db.division.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: like }, { summary: like }, { body: like }],
      },
      take: MAX_PER_KIND,
      select: { id: true, slug: true, title: true, summary: true },
    }),
    db.equipment.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ name: like }, { description: like }, { category: like }],
      },
      take: MAX_PER_KIND,
      select: { id: true, name: true, description: true },
    }),
    db.project.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: like }, { scope: like }, { clientName: like }, { industry: like }],
      },
      take: MAX_PER_KIND,
      select: { id: true, slug: true, title: true, scope: true },
    }),
    db.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: like }, { excerpt: like }, { body: like }],
      },
      take: MAX_PER_KIND,
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
    db.certification.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ name: like }, { issuer: like }, { description: like }],
      },
      take: MAX_PER_KIND,
      select: { id: true, name: true, issuer: true },
    }),
  ]);

  return [
    ...divisions.map((d): SearchHit => ({
      id: d.id, title: d.title, excerpt: d.summary,
      href: `/divisions/${d.slug}`, kind: "Division",
    })),
    ...equipment.map((e): SearchHit => ({
      id: e.id, title: e.name, excerpt: e.description,
      href: "/equipment", kind: "Equipment",
    })),
    ...projects.map((p): SearchHit => ({
      id: p.id, title: p.title, excerpt: p.scope,
      href: `/projects/${p.slug}`, kind: "Project",
    })),
    ...posts.map((p): SearchHit => ({
      id: p.id, title: p.title, excerpt: p.excerpt,
      href: `/news/${p.slug}`, kind: "News",
    })),
    ...certifications.map((c): SearchHit => ({
      id: c.id, title: c.name, excerpt: c.issuer,
      href: "/certifications", kind: "Certification",
    })),
  ];
}
