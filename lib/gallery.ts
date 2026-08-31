import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Event photography, grouped into albums.
 *
 * Images come back with the album so the index can show a cover and a count
 * without a second round trip; there is no per-album page yet, matching the
 * reference site, which shows everything on one gallery.
 */
export async function getGalleryAlbums() {
  "use cache";
  cacheTag(tags.gallery());
  cacheLife("days");

  return db.galleryAlbum.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { eventDate: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      eventDate: true,
      images: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          media: { select: { secureUrl: true, alt: true, width: true, height: true } },
        },
      },
    },
  });
}

/** Consistent, locale-stable date rendering for album headings. */
export function formatEventDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
