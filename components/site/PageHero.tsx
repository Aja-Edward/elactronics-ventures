import Image from "next/image";
import Link from "next/link";

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
export default function PageHero({
  title,
  crumb,
  intro,
  trail = [],
  image,
}: {
  title: string;
  /** Breadcrumb label, when the full page title is too long for the trail. */
  crumb?: string;
  intro?: string;
  trail?: Crumb[];
  /**
   * Optional background photo. Omit it and the band renders exactly as it
   * always has — every page that does not pass one is untouched.
   */
  image?: HeroImage | null;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      {image && (
        <>
          {/* Empty alt: this is decoration behind the heading, and the <h1>
              below already names the page. Announcing the photo as well would
              just make a screen reader read the page title twice. */}
          <Image
            src={image.secureUrl}
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
