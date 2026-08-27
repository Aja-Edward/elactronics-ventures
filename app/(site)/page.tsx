import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { tags } from "@/lib/cache-tags";
import HeroCarousel from "@/components/site/HeroCarousel";
import WelcomeHero from "@/components/site/WelcomeHero";
import { getPublishedCertifications } from "@/lib/certifications";
import { getPublishedHeroSlides } from "@/lib/hero";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site";

/**
 * Reads divisions straight from the database in a Server Component - no
 * fetch back into our own /api. Cached under the "divisions" tag, so
 * publishing a division invalidates this without a rebuild.
 */
async function getFeaturedDivisions() {
  "use cache";
  cacheTag(tags.divisions());
  cacheLife("days");

  try {
    return await db.division.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      take: 6,
      select: { id: true, slug: true, title: true, summary: true },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const [site, divisions, certifications, heroSlides] = await Promise.all([
    getSiteSettings(),
    getFeaturedDivisions(),
    getPublishedCertifications(),
    getPublishedHeroSlides(),
  ]);

  return (
    <>
      {/* Hero. Slides come from the CMS; the static block below is the fallback
          when none are published, so the homepage is never headless. */}
      {heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} />
      ) : (
        <section className="relative overflow-hidden bg-brand-950">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-300">
                {[site.city, site.country].filter(Boolean).join(", ")}
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Engineering, construction and asset integrity
                <span className="text-steel-300"> for the energy sector.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-200">
                {site.defaultSeoDescription}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/request-quote"
                  className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
                >
                  Request a Quote
                </Link>
                <Link
                  href="/divisions"
                  className="rounded border border-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-500 hover:bg-white/5"
                >
                  Our Divisions
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="flex justify-center align-items-center">
        <WelcomeHero
        companyName="Elatronics Ventures"
        description="We are a private limited liability company incorporated in Nigeria in March 2003[br]to provide services to the Oil and Gas Industries using innovative and high tech approach"
        highlightedText="Elatronics Ventures specializes in rendering professional and innovative[br]services to the oil and gas upstream and down-stream sectors"
      />
      </section>
      
      {/* Divisions */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
              What we do
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              Capabilities across the project lifecycle
            </h2>
          </div>

          {divisions.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {divisions.map((division) => (
                <Link
                  key={division.id}
                  href={`/divisions/${division.slug}`}
                  className="group rounded-lg border border-brand-100 bg-surface p-6 transition-colors hover:border-brand-300"
                >
                  <h3 className="font-display text-lg font-semibold text-brand-900 group-hover:text-accent-600">
                    {division.title}
                  </h3>
                  {division.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-steel-700">
                      {division.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            // Deliberately explicit rather than an empty grid: this is what an
            // unseeded database looks like, and saying so beats a blank section.
            <div className="mt-10 rounded-lg border border-dashed border-brand-200 bg-surface p-10 text-center">
              <p className="text-sm text-steel-700">
                No divisions published yet — run the seed, or add them from the
                admin once it exists.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Accreditation strip.
          Rendered only when something is published — an empty "Accredited by"
          band is worse than no band at all, and on an engineering site an
          unfilled credentials section actively undermines trust. */}
      {certifications.length > 0 && (
        <section className="border-t border-brand-100 bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-600">
                Accreditations &amp; certifications
              </h2>
              <Link
                href="/certifications"
                className="text-xs font-semibold text-brand-900 hover:text-accent-600"
              >
                View all
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-6">
              {certifications.slice(0, 8).map((cert) => (
                <li key={cert.id} className="flex items-center gap-3">
                  {cert.file ? (
                    <span className="relative h-12 w-28 shrink-0">
                      <Image
                        src={cert.file.secureUrl}
                        alt={cert.file.alt || cert.name}
                        fill
                        sizes="112px"
                        // contain: these arrive as anything from a square body
                        // logo to a wide certificate banner.
                        className="object-contain object-left"
                      />
                    </span>
                  ) : (
                    <span className="font-display text-sm font-semibold text-brand-900">
                      {cert.issuer ?? cert.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Contact strip */}
      <section className="border-t border-brand-100 bg-surface py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Have a project to discuss?
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              Tell us the scope and we will come back with a quote.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
