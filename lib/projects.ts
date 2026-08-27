import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Projects are a past-performance record. Every entry is a claim that this
 * company delivered that scope, so the editor keeps client, year and division
 * as first-class fields rather than free prose.
 */

export async function getPublishedProjects() {
  "use cache";
  cacheTag(tags.projects());
  cacheLife("days");

  return db.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { year: "desc" }, { title: "asc" }],
    select: {
      id: true, slug: true, title: true, clientName: true, industry: true,
      location: true, year: true, scope: true, isFeatured: true,
      heroImage: { select: { secureUrl: true, alt: true } },
      division: { select: { slug: true, title: true } },
    },
  });
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheTag(tags.projects(), tags.project(slug));
  cacheLife("days");

  return db.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, clientName: true, industry: true,
      location: true, year: true, scope: true,
      challenge: true, solution: true, results: true,
      seoTitle: true, seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true } },
      division: { select: { slug: true, title: true } },
      gallery: {
        orderBy: { order: "asc" },
        select: { id: true, media: { select: { secureUrl: true, alt: true } } },
      },
    },
  });
}

export async function getProjectSlugs() {
  "use cache";
  cacheTag(tags.projects());
  cacheLife("days");
  const rows = await db.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return rows.map((r: { slug: string }) => r.slug);
}
