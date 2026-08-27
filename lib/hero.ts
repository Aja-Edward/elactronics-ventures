import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
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

  return rows.map((r) => ({
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
