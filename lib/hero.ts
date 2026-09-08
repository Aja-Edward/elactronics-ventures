import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { MIN_BANNER_WIDTH } from "./images";
import { db } from "./db";

export async function getPublishedHeroSlides() {
  "use cache";
  cacheTag(tags.heroSlides());
  cacheLife("days");

  const rows = await db.heroSlide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, title: true, subtitle: true,
      ctaLabel: true, ctaHref: true, ctaAltLabel: true, ctaAltHref: true,
      image: { select: { secureUrl: true, alt: true } },
    },
  });

  return rows.map((r: (typeof rows)[number]) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.image?.secureUrl ?? null,
    imageAlt: r.image?.alt ?? null,
    ctaLabel: r.ctaLabel,
    ctaHref: r.ctaHref,
    ctaAltLabel: r.ctaAltLabel,
    ctaAltHref: r.ctaAltHref,
  }));
}

/**
 * The banner every inner page falls back to.
 *
 * Most routes have no image of their own — a division sub-page, a news post
 * written in a hurry — and the band then rendered as flat navy, which reads as
 * a missing image rather than a design choice. Rather than asking an editor to
 * pick a banner fourteen times, this reuses the first published hero slide:
 * already curated, already the best photograph on the site, and it changes
 * everywhere the moment that slide is reordered or replaced. A page that does
 * set its own image still wins.
 */
export async function getDefaultBanner() {
  "use cache";
  cacheTag(tags.heroSlides());
  cacheLife("days");

  // Filtered on width, not merely on having an image. This is the last resort
  // in PageHero's chain, so a fallback that could itself fail the size check
  // would turn the guard from a safety net into a way of removing banners: the
  // page would drop to a bare navy band rather than to a photograph. Skipping
  // to the first slide that is large enough keeps the fallback dependable
  // however the carousel is ordered or re-illustrated later.
  const slide = await db.heroSlide.findFirst({
    where: {
      status: "PUBLISHED",
      image: { is: { width: { gte: MIN_BANNER_WIDTH } } },
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { image: { select: { secureUrl: true, alt: true, width: true } } },
  });

  return slide?.image ?? null;
}
