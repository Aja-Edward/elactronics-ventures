import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import PageHero from "@/components/site/PageHero";
import {
  CATEGORY_LABEL,
  getDivisionService,
  getDivisionServiceParams,
  getDivisionServiceSiblings,
  type DivisionCategory,
} from "@/lib/divisions";
import { findRedirect } from "@/lib/redirects";

// Reads params, which is per-request data, so this route blocks rather than
// prerendering a shell. The body is still cached under the division's and the
// record's own tags, so the database is hit once per invalidation.
export const instant = false;

/**
 * Cache Components requires at least one entry or the build fails, and a
 * division whose last sub-page is unpublished must not break the next deploy.
 * The sentinel prerenders as a 404 and is linked from nowhere.
 */
export async function generateStaticParams() {
  const params = await getDivisionServiceParams();
  return params.length ? params : [{ slug: "__none__", item: "__none__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/divisions/[slug]/[item]">): Promise<Metadata> {
  const { slug, item } = await params;
  const service = await getDivisionService(slug, item);

  if (!service) return { title: "Not found", robots: { index: false } };

  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.summary || undefined,
    alternates: { canonical: `/divisions/${slug}/${service.slug}` },
    openGraph: {
      title: service.seoTitle || service.title,
      description: service.seoDescription || service.summary || undefined,
      type: "article",
      images: service.heroImage
        ? [{ url: service.heroImage.secureUrl, alt: service.heroImage.alt ?? "" }]
        : undefined,
    },
  };
}

export default async function DivisionServicePage({
  params,
}: PageProps<"/divisions/[slug]/[item]">) {
  const { slug, item } = await params;
  const service = await getDivisionService(slug, item);

  // `division` is non-null for anything the query can return — it filters on
  // the parent — but the generated type does not know that, and narrowing here
  // costs nothing and avoids an assertion.
  if (!service?.division) {
    // Only URLs that would otherwise 404 pay for the redirect lookup.
    const moved = await findRedirect(`/divisions/${slug}/${item}`);
    if (moved) permanentRedirect(moved.destination);

    // Covers "does not exist", "is a draft", and "belongs to a different
    // division" alike — none of them may be distinguishable from outside.
    notFound();
  }

  const division = service.division;
  const siblings = await getDivisionServiceSiblings(slug);

  return (
    <>
      <PageHero
        title={service.title}
        eyebrow={CATEGORY_LABEL[division.category as DivisionCategory]}
        intro={service.summary ?? undefined}
        trail={[
          { label: "Divisions", href: "/divisions" },
          { label: division.title, href: `/divisions/${division.slug}` },
        ]}
        // Falls through to the division's banner, then the site default, so a
        // record an editor has not photographed yet still opens with a picture
        // rather than a navy slab.
        image={service.heroImage}
      />

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.7fr_1fr]">
          <div>
            {service.body ? (
              // Plain text today, same as every other body on the site. When
              // the editor gains rich text this is one of the places to change.
              <div className="prose-measure space-y-4">
                {service.body.split(/\n{2,}/).map((paragraph, i) => (
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

            <p className="mt-10 text-sm text-steel-700">
              Part of{" "}
              <Link
                href={`/divisions/${division.slug}`}
                className="font-semibold text-brand-900 underline underline-offset-2 hover:text-accent-600"
              >
                {division.title}
              </Link>
              .
            </p>
          </div>

          <aside className="space-y-6">
            {/* The sibling list. With dozens of records under a division,
                going back to the index between every two of them is the
                difference between browsing the range and giving up on it. */}
            {siblings.length > 1 && (
              <nav
                aria-label={`More in ${division.title}`}
                className="rounded-lg border border-brand-100 bg-surface p-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                  More in {division.title}
                </h2>
                <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto pr-1">
                  {siblings.map((sibling) => {
                    const current = sibling.slug === service.slug;
                    return (
                      <li key={sibling.id}>
                        <Link
                          href={`/divisions/${division.slug}/${sibling.slug}`}
                          aria-current={current ? "page" : undefined}
                          className={`block rounded px-2 py-1.5 text-sm leading-snug transition-colors ${
                            current
                              ? "bg-brand-900 font-semibold text-white"
                              : "text-steel-800 hover:bg-brand-50 hover:text-brand-900"
                          }`}
                        >
                          {sibling.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            <div className="rounded-lg bg-brand-950 p-6">
              <h2 className="font-display text-lg font-bold text-white">
                Enquire about {service.title.toLowerCase()}
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
