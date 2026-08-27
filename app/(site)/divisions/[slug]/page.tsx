import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import {
  CATEGORY_LABEL,
  getDivisionBySlug,
  
  type DivisionCategory,
} from "@/lib/divisions";
import { getDivisionSlugs } from "@/lib/divisions";
import { findRedirect } from "@/lib/redirects";

/**
 * Deliberately no generateStaticParams.
 *
 * Under Cache Components it must return at least one entry or the build fails.
 * That held while thirteen divisions were seeded, but it means an admin who
 * unpublishes the last one breaks the next deploy — a failure that surfaces
 * far from its cause. Rendering on demand and caching under the division's own
 * tag costs only the first request, and cannot be broken by editing content.
 */

// Reads params, which is per-request data, so this route blocks rather than
// prerendering a shell. The page body is still cached under its own tag, so
// the database is hit once per invalidation, not once per visitor.
export const instant = false;

/**
 * Cache Components requires generateStaticParams to return at least one
 * entry, or the build fails outright. Returning the sentinel when the table
 * is empty keeps two properties at once: unknown slugs still get a real 404
 * status (a route with no prerendered params serves a soft 404 - HTTP 200
 * with the not-found body), and deleting the last row never breaks a deploy.
 * The sentinel prerenders as a 404 and is linked from nowhere.
 */
export async function generateStaticParams() {
  const slugs = await getDivisionSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/divisions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const division = await getDivisionBySlug(slug);

  if (!division) return { title: "Not found", robots: { index: false } };

  // Fall back through explicit SEO field -> title/summary, so a page is never
  // published with an empty description.
  return {
    title: division.seoTitle || division.title,
    description: division.seoDescription || division.summary || undefined,
    alternates: { canonical: `/divisions/${division.slug}` },
    openGraph: {
      title: division.seoTitle || division.title,
      description: division.seoDescription || division.summary || undefined,
      type: "article",
      images: division.heroImage
        ? [{ url: division.heroImage.secureUrl, alt: division.heroImage.alt ?? "" }]
        : undefined,
    },
  };
}

export default async function DivisionPage({
  params,
}: PageProps<"/divisions/[slug]">) {
  const { slug } = await params;
  const division = await getDivisionBySlug(slug);

  if (!division) {
    // Before giving up, check whether this slug was renamed. Doing the lookup
    // here rather than on every request means the cost lands only on URLs that
    // would otherwise 404.
    const moved = await findRedirect(`/divisions/${slug}`);
    if (moved) {
      permanentRedirect(moved.destination);
    }

    // Covers both "does not exist" and "exists but is a draft" — an
    // unpublished division must be indistinguishable from a missing one.
    notFound();
  }

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950">
        {division.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={division.heroImage.secureUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
          </div>
        )}
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/divisions" className="hover:text-white">
              Divisions
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">{division.title}</span>
          </nav>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300">
            {CATEGORY_LABEL[division.category as DivisionCategory]}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {division.title}
          </h1>
          {division.summary && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-200">
              {division.summary}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.7fr_1fr]">
          <div>
            {division.body ? (
              // Stored as plain text today. When the editor gains rich text,
              // this becomes the single place that needs to change.
              <div className="prose-measure space-y-4">
                {division.body
                  .split(/\n{2,}/)
                  .map((paragraph, i) => (
                    <p key={i} className="leading-relaxed text-steel-800">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-steel-600">
                Detailed description coming soon.
              </p>
            )}

            {division.services.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                  Services
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {division.services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-lg border border-brand-100 bg-surface p-5"
                    >
                      <h3 className="font-display text-base font-semibold text-brand-900">
                        {service.title}
                      </h3>
                      {service.summary && (
                        <p className="mt-1.5 text-sm leading-relaxed text-steel-700">
                          {service.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {division.projects.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                  Selected projects
                </h2>
                <ul className="mt-5 divide-y divide-brand-100 border-y border-brand-100">
                  {division.projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 py-3"
                    >
                      <span className="font-medium text-brand-900">
                        {project.title}
                      </span>
                      <span className="text-sm text-steel-600 tabular-nums">
                        {[project.clientName, project.year].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {division.capabilities.length > 0 && (
              <div className="rounded-lg border border-brand-100 bg-surface p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                  Capabilities
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {division.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="flex gap-2.5 text-sm leading-relaxed text-steel-800"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600"
                      />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg bg-brand-950 p-6">
              <h2 className="font-display text-lg font-bold text-white">
                Discuss a {division.title.toLowerCase()} scope
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">
                Send us the details and we will respond with a quote.
              </p>
              <Link
                href="/request-quote"
                className="mt-4 inline-block rounded bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
              >
                Request a Quote
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
