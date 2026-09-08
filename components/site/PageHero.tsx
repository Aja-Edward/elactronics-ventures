import Image from "next/image";
import Link from "next/link";

import { getDefaultBanner } from "@/lib/hero";
import { MIN_BANNER_WIDTH, bigEnough, type SizedImage } from "@/lib/images";
import { getPageHero } from "@/lib/pages";

export type Crumb = { label: string; href: string };

/** Re-exported so the routes that build one keep importing it from here. */
export type HeroImage = SizedImage;

/**
 * The banner band every inner page opens with.
 *
 * Extracted when About was split into eight pages — writing the same twelve
 * lines of markup out eight more times is how the pages drift apart. The
 * divisions, projects and skid-package detail routes each grew their own copy
 * of it later and have since been folded back in, which is why this takes an
 * `eyebrow`: that was the only thing the division band had which this did not.
 */
export default async function PageHero({
  title,
  crumb,
  eyebrow,
  intro,
  trail = [],
  image,
  pageSlug,
}: {
  title: string;
  /** Breadcrumb label, when the full page title is too long for the trail. */
  crumb?: string;
  /** Small line above the heading — the division's category, for one. */
  eyebrow?: string;
  intro?: string;
  trail?: Crumb[];
  /**
   * A banner passed in directly. Wins over pageSlug, for the case where a
   * route already holds the Media record and a second query would be waste.
   */
  image?: HeroImage | null;
  /**
   * Look the banner up from the CMS instead: the Page row with this slug, set
   * by an editor under Pages. The lookup happens here rather than in fourteen
   * routes so there is one place it can go wrong, and adding a banner to a
   * page stays a one-prop change.
   */
  pageSlug?: string;
}) {
  // Own image first, then the page's CMS banner, then the site-wide fallback -
  // skipping any candidate the size check rejects, so a thumbnail set on one
  // record degrades to the site's own banner rather than to a smeared upscale.
  // Each step is only reached, and only queried, if the one before it fails.
  const banner =
    bigEnough(image, MIN_BANNER_WIDTH) ??
    (pageSlug ? bigEnough(await getPageHero(pageSlug), MIN_BANNER_WIDTH) : null) ??
    bigEnough(await getDefaultBanner(), MIN_BANNER_WIDTH);

  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      {banner && (
        <>
          {/* Empty alt: this is decoration behind the heading, and the <h1>
              below already names the page. Announcing the photo as well would
              just make a screen reader read the page title twice. */}
          <Image
            src={banner.secureUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          {/* Contrast floor, in two layers rather than one flat wash.
              The band's text is white because brand-950 guarantees it; over an
              arbitrary photo that guarantee is gone. A single opaque-enough
              wash buys that guarantee by hiding the photograph, which is what
              the old 75% tint did — the banner may as well not have been
              there. So: a light uniform floor everywhere, plus a gradient that
              deepens only over the left column where the copy actually sits.
              The heading clears WCAG AA against the darkest reach of the
              gradient, and the right-hand two thirds of the image stay
              legible as a picture. */}
          {/* A little heavier on narrow screens, where the copy runs the full
              width of the band and so crosses the bright end of the gradient
              too. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-brand-950/45 sm:bg-brand-950/35"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/75 via-brand-950/45 to-transparent"
          />
        </>
      )}
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <nav aria-label="Breadcrumb" className="text-xs text-steel-200">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {trail.map((step) => (
            <span key={step.href}>
              <span className="mx-2 text-steel-400">/</span>
              <Link href={step.href} className="hover:text-white">
                {step.label}
              </Link>
            </span>
          ))}
          <span className="mx-2 text-steel-400">/</span>
          <span className="text-white">{crumb ?? title}</span>
        </nav>
        {eyebrow && (
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-steel-200">
            {eyebrow}
          </p>
        )}
        <h1
          className={`${eyebrow ? "mt-3" : "mt-5"} max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl`}
        >
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-100">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
