import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { tags } from "@/lib/cache-tags";
import HeroCarousel from "@/components/site/HeroCarousel";
import WelcomeHero from "@/components/site/WelcomeHero";
import { getPublishedCertifications } from "@/lib/certifications";
import { getPublishedHeroSlides } from "@/lib/hero";
import { formatPostDate, getPublishedPosts } from "@/lib/news";
import { getOemPartners } from "@/lib/oem";
import { getPublishedProjects } from "@/lib/projects";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site";

/**
 * Shown in a division card's image slot when it has no hero image yet. The
 * raw enum values are not presentable, and repeating the title there would
 * just print it twice on the same card.
 */
const DIVISION_CATEGORY_LABELS: Record<
  "EPCIM" | "SERVICE_OFFERING" | "PROCUREMENT",
  string
> = {
  EPCIM: "EPCIM",
  SERVICE_OFFERING: "Service",
  PROCUREMENT: "Procurement",
};

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
      // No cap: this is the full service overview, not a teaser. Every
      // published division belongs here, and a silent take() would drop
      // whichever ones sort last as the list grows.
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        heroImage: { select: { secureUrl: true, alt: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const [
    site,
    divisions,
    certifications,
    heroSlides,
    allProjects,
    allNews,
    oemPartners,
  ] = await Promise.all([
    getSiteSettings(),
    getFeaturedDivisions(),
    getPublishedCertifications(),
    getPublishedHeroSlides(),
    getPublishedProjects(),
    getPublishedPosts("NEWS"),
    getOemPartners(),
  ]);

  // getPublishedProjects already sorts featured first, then newest year — so
  // the first four are the "latest". Sliced here rather than with a take() in
  // a bespoke query, so this shares the /projects cache entry instead of
  // adding a second one that has to be invalidated alongside it.
  const projects = allProjects.slice(0, 4);

  // Same reasoning for news: getPublishedPosts already sorts featured first,
  // then newest published, so the homepage takes the top three off the shared
  // /news cache entry rather than running a second, separately-invalidated
  // query.
  const posts = allNews.slice(0, 3);

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
          {/* Heading, standfirst, rule — the eyebrow that used to sit above
              the heading is gone, so the block reads in the same three beats
              as the rest of the section. Wording follows the positioning
              already set in WelcomeHero above rather than introducing a
              second, competing description of the company. */}
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              Capabilities across the project lifecycle
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel-700">
              Elatronics Ventures provides professional and innovative services
              to the upstream and downstream oil and gas sectors — spanning
              procurement, construction and installation, inspection,
              maintenance and asset integrity.
            </p>
            <div aria-hidden className="mt-6 h-1 w-12 bg-accent-600" />
          </div>

          {divisions.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {divisions.map((division) => (
                <Link
                  key={division.id}
                  href={`/divisions/${division.slug}`}
                  className="group flex min-h-[88px] items-stretch overflow-hidden rounded-sm border border-brand-100 bg-white transition-colors hover:border-brand-300"
                >
                  {/* Fixed-width strip down the left, stretched to whatever
                      height the title needs. Filled or not: only some
                      divisions will have an image, and a row where imaged
                      cards are a different size to un-imaged ones reads as
                      broken rather than half-finished. */}
                  <div className="relative w-24 shrink-0 self-stretch bg-surface">
                    {division.heroImage ? (
                      <Image
                        src={division.heroImage.secureUrl}
                        alt={division.heroImage.alt || division.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-steel-400">
                        {DIVISION_CATEGORY_LABELS[division.category]}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-3">
                    <h3 className="text-sm leading-snug text-brand-900 group-hover:text-accent-600">
                      {division.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-600">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                        aria-hidden
                      >
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                      Read More
                    </span>
                  </div>
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

      {/* Latest projects.
          Hidden entirely when nothing is published rather than showing an
          empty shell: on an engineering site, a past-performance section with
          no entries in it reads worse than not claiming one at all — the same
          reasoning as the accreditation strip below. */}
      {projects.length > 0 && (
        <section className="border-t border-brand-100 bg-surface py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                Latest Projects
              </h2>
              <p className="mt-4 text-base leading-relaxed text-steel-700">
                Recent work delivered for operators and contractors across the
                Nigerian oil and gas industry.
              </p>
              <div aria-hidden className="mt-6 h-1 w-12 bg-accent-600" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm border border-brand-100 bg-white transition-colors hover:border-brand-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    {project.heroImage ? (
                      <Image
                        src={project.heroImage.secureUrl}
                        alt={project.heroImage.alt || project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-steel-400">
                        Project
                      </span>
                    )}
                    {/* Reveal-on-hover call to action. The title and client
                        stay below the image rather than living in here: an
                        overlay is a pointer affordance, and a touch device
                        never fires hover, so anything only shown inside it
                        would be unreachable on a phone. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center bg-brand-950/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <span className="rounded-sm bg-accent-600 px-4 py-2 text-xs font-semibold text-white">
                        View Project
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                    <h3 className="text-sm leading-snug text-brand-900 group-hover:text-accent-600">
                      {project.title}
                    </h3>
                    {project.clientName && (
                      <p className="text-xs uppercase tracking-wide text-steel-400">
                        {project.clientName}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest news. Same empty-state reasoning as the sections around it:
          a news band with nothing in it says the site is unmaintained. */}
      {posts.length > 0 && (
        <section className="border-t border-brand-100 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                  Latest News
                </h2>
                <p className="mt-4 text-base leading-relaxed text-steel-700">
                  Updates from across our divisions and the wider industry.
                </p>
                <div aria-hidden className="mt-6 h-1 w-12 bg-accent-600" />
              </div>
              <Link
                href="/news"
                className="text-xs font-semibold text-brand-900 hover:text-accent-600"
              >
                View all news
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-sm border border-brand-100 bg-white transition-colors hover:border-brand-300"
                >
                  <div className="relative aspect-[5/3] bg-surface">
                    {post.heroImage ? (
                      <Image
                        src={post.heroImage.secureUrl}
                        alt={post.heroImage.alt || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-steel-400">
                        News
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-sm font-semibold leading-snug text-brand-900 group-hover:text-accent-600">
                      {post.title}
                    </h3>
                    {formatPostDate(post.publishedAt) && (
                      <p className="text-xs text-steel-400">
                        {formatPostDate(post.publishedAt)}
                      </p>
                    )}
                    <span className="mt-auto pt-2 text-xs font-semibold text-accent-600">
                      Read more
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partnerships and OEM authorisations.
          A logo wall, so object-contain on a padded tile rather than cover:
          these arrive as wordmarks of wildly different proportions, and
          cropping a manufacturer's logo to fill a box is the one thing an
          authorised distributor must not do. Certifications are deliberately
          not repeated here — they have their own strip below. */}
      {oemPartners.length > 0 && (
        <section className="border-t border-brand-100 bg-surface py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                  Our Partnership, Authorizations and OEM Agency
                </h2>
                <p className="mt-4 text-base leading-relaxed text-steel-700">
                  We hold authorisations and agency agreements with original
                  equipment manufacturers, so equipment and spares are supplied
                  to specification and backed by the maker.
                </p>
                <div aria-hidden className="mt-6 h-1 w-12 bg-accent-600" />
              </div>
              <Link
                href="/oem"
                className="text-xs font-semibold text-brand-900 hover:text-accent-600"
              >
                View all partners
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {oemPartners.map((partner) => (
                <li key={partner.id}>
                  <div
                    className="flex h-24 items-center justify-center rounded-sm border border-brand-100 bg-white px-4"
                    title={partner.name}
                  >
                    {partner.logo ? (
                      <span className="relative h-full w-full">
                        <Image
                          src={partner.logo.secureUrl}
                          alt={partner.logo.alt || partner.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-contain p-2"
                        />
                      </span>
                    ) : (
                      // Named rather than blank: a partner without a logo yet
                      // is still a credential worth showing.
                      <span className="text-center text-xs font-semibold leading-tight text-steel-700">
                        {partner.name}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
