/**
 * Size guards for CMS-chosen imagery.
 *
 * Nothing in the admin stops an editor picking a 120x120 thumbnail as a
 * page banner or a card photo, and nine division banners were exactly that for
 * months — invisible as a problem while the band sat under a 75% wash, obvious
 * the moment it was allowed to show. These are the floors below which an image
 * is refused and the caller falls back to something dependable.
 *
 * Both are deliberately low, and should stay that way. The job is to catch
 * thumbnails, not to enforce an ideal: a 120px image blown up ten times is
 * unusable, while a 700px photograph is merely soft, and silently replacing
 * someone's chosen picture with a generic one is the worse of the two
 * outcomes. Raise either of these and the guard starts overriding editorial
 * decisions rather than protecting them.
 */

/** Banners render at 100vw, so they need the most pixels behind them. */
export const MIN_BANNER_WIDTH = 600;

/**
 * Cards render at roughly a third of a 1280px viewport, so ~420 CSS px. Below
 * 400 the source is being upscaled even before device pixel ratio is counted.
 */
export const MIN_CARD_WIDTH = 400;

/** A Media row in the shape the page queries select it. */
export type SizedImage = {
  secureUrl: string;
  alt?: string | null;
  /**
   * Optional so a query that has not been plumbed through yet still compiles —
   * it simply opts out of the check rather than failing to build.
   */
  width?: number | null;
};

/**
 * Return the image if it is big enough for the slot, otherwise null.
 *
 * Null rather than a boolean so candidates chain readably with `??`:
 *
 *   bigEnough(own, MIN_CARD_WIDTH) ?? bigEnough(parent, MIN_CARD_WIDTH)
 *
 * An unknown width passes. Metadata can be missing for reasons that have
 * nothing to do with the picture, and dropping a good photograph on a guess is
 * worse than showing a soft one — the check should only bite when the database
 * says outright that the image is tiny.
 */
export function bigEnough<T extends SizedImage>(
  image: T | null | undefined,
  minWidth: number,
): T | null {
  if (!image) return null;
  if (image.width == null) return image;
  return image.width >= minWidth ? image : null;
}
