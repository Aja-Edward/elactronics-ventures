import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Public reads for divisions.
 *
 * Every query filters status = PUBLISHED. A draft must 404 on the public site,
 * not merely be unlinked — otherwise anyone who guesses or remembers a URL can
 * read unfinished content.
 */

export type DivisionCategory = "EPCIM" | "SERVICE_OFFERING" | "PROCUREMENT";

export const CATEGORY_LABEL: Record<DivisionCategory, string> = {
  EPCIM: "Engineering, Procurement, Construction & Maintenance",
  SERVICE_OFFERING: "Specialist Service Divisions",
  PROCUREMENT: "Procurement",
};

/** Display order of the groups on the index page. */
export const CATEGORY_ORDER: DivisionCategory[] = [
  "EPCIM",
  "SERVICE_OFFERING",
  "PROCUREMENT",
];

export async function getPublishedDivisions() {
  "use cache";
  cacheTag(tags.divisions());
  cacheLife("days");

  return db.division.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      category: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getDivisionBySlug(slug: string) {
  "use cache";
  // Tagged individually as well as collectively, so editing one division does
  // not have to invalidate every division page.
  cacheTag(tags.divisions(), tags.division(slug));
  cacheLife("days");

  return db.division.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      capabilities: true,
      category: true,
      seoTitle: true,
      seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true, width: true, height: true } },
      services: {
        where: { status: "PUBLISHED" },
        orderBy: [{ order: "asc" }, { title: "asc" }],
        select: { id: true, slug: true, title: true, summary: true },
      },
      projects: {
        where: { status: "PUBLISHED" },
        orderBy: [{ year: "desc" }, { title: "asc" }],
        take: 3,
        select: { id: true, slug: true, title: true, clientName: true, year: true },
      },
    },
  });
}

/** Slugs for generateStaticParams. */
export async function getDivisionSlugs() {
  "use cache";
  cacheTag(tags.divisions());
  cacheLife("days");

  const rows = await db.division.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r: { slug: string }) => r.slug);
}
