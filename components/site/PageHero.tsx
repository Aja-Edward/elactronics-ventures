import Image from "next/image";
import Link from "next/link";

import { getPageHero } from "@/lib/pages";

export type Crumb = { label: string; href: string };

/** A Media record, in the shape the page queries already select it. */
export type HeroImage = { secureUrl: string; alt?: string | null };

/**
 * The dark breadcrumb band every inner page opens with.
 *
 * Extracted when About was split into eight pages — writing the same twelve
 * lines of markup out eight more times is how the pages drift apart. The
 * markup is deliberately identical to what the existing pages already render,
 * so nothing shifts visually.
 *
 * `trail` holds the ancestors between Home and this page; the current page is
 * the last crumb and is not a link.
 */
export default async function PageHero({
  title,
  crumb,
  intro,
  trail = [],
  image,
  pageSlug,
}: {
  title: string;
  /** Breadcrumb label, when the full page title is too long for the trail. */
  crumb?: string;
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
  // Omit both and the band renders exactly as it always has — every page that
  // opts out is untouched.
  const banner = image ?? (pageSlug ? await getPageHero(pageSlug) : null);

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
          {/* Contrast floor. The band's text is white because brand-950
              guarantees it; over an arbitrary photo that guarantee is gone,
              and a pale sky behind the breadcrumb would make it unreadable.
              The section keeps bg-brand-950 underneath, so a slow or failed
              image load still leaves readable text rather than a flash of
              white-on-white. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-brand-950/75" />
        </>
      )}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {trail.map((step) => (
            <span key={step.href}>
              <span className="mx-2 text-steel-500">/</span>
              <Link href={step.href} className="hover:text-white">
                {step.label}
              </Link>
            </span>
          ))}
          <span className="mx-2 text-steel-500">/</span>
          <span className="text-white">{crumb ?? title}</span>
        </nav>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
