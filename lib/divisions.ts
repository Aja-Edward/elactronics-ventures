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

/**
 * Heading above a division's sub-pages.
 *
 * "Services" is right for an engineering division and wrong for procurement,
 * where the children are supply lines rather than things we do. Keyed on the
 * category so a new division inherits sensible wording without an edit.
 */
export const SUBPAGE_HEADING: Record<DivisionCategory, string> = {
  EPCIM: "Services",
  SERVICE_OFFERING: "Services",
  PROCUREMENT: "What we supply",
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
      // width feeds the MIN_CARD_WIDTH guard on the index grid.
      heroImage: { select: { secureUrl: true, alt: true, width: true } },
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
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          heroImage: { select: { secureUrl: true, alt: true, width: true } },
        },
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

/**
 * One sub-page beneath a division.
 *
 * Divisions on the reference site are not single pages but sections: the
 * procurement division alone lists close to ninety records, each with its own
 * photograph and its own page. Those records are `Service` rows pointing at
 * the division, so this reads a service through its parent rather than by slug
 * alone — an unpublished or missing division must take its children offline
 * with it, or a draft division would still be readable one URL deeper.
 */
export async function getDivisionService(divisionSlug: string, serviceSlug: string) {
  "use cache";
  cacheTag(tags.divisions(), tags.division(divisionSlug), tags.services(), tags.service(serviceSlug));
  cacheLife("days");

  return db.service.findFirst({
    where: {
      slug: serviceSlug,
      status: "PUBLISHED",
      division: { slug: divisionSlug, status: "PUBLISHED" },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      seoTitle: true,
      seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true, width: true, height: true } },
      division: { select: { slug: true, title: true, category: true } },
    },
  });
}

/**
 * The other pages in the same division, for the sidebar list.
 *
 * The reference site puts every sibling in the sidebar of each record, which
 * is how a visitor moves between eighty-odd procurement items without going
 * back to the index. Cached under the division's tag, so publishing a sibling
 * refreshes the list on all of them.
 */
export async function getDivisionServiceSiblings(divisionSlug: string) {
  "use cache";
  cacheTag(tags.divisions(), tags.division(divisionSlug), tags.services());
  cacheLife("days");

  return db.service.findMany({
    where: { status: "PUBLISHED", division: { slug: divisionSlug, status: "PUBLISHED" } },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true },
  });
}

/** Division/service slug pairs for generateStaticParams. */
export async function getDivisionServiceParams() {
  "use cache";
  cacheTag(tags.divisions(), tags.services());
  cacheLife("days");

  const rows = await db.service.findMany({
    where: { status: "PUBLISHED", division: { status: "PUBLISHED" } },
    select: { slug: true, division: { select: { slug: true } } },
  });

  return rows.flatMap((r: (typeof rows)[number]) =>
    r.division ? [{ slug: r.division.slug, item: r.slug }] : [],
  );
}
