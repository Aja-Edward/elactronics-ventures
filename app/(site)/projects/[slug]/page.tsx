import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { findRedirect } from "@/lib/redirects";

/**
 * Deliberately no generateStaticParams.
 *
 * Under Cache Components it must return at least one entry or the build fails
 * outright — which means an empty (or emptied) table takes the whole deploy
 * down. That is a bad trap in a client-managed CMS: deleting the last project
 * should not break the build.
 *
 * Pages are rendered on demand instead and cached under their own tag, so the
 * only cost is the first request after a deploy or an invalidation.
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
  const slugs = await getProjectSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not found", robots: { index: false } };

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.scope || undefined,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.scope || undefined,
      type: "article",
      images: project.heroImage
        ? [{ url: project.heroImage.secureUrl, alt: project.heroImage.alt ?? "" }]
        : undefined,
    },
  };
}

const NARRATIVE = [
  ["challenge", "Challenge"],
  ["solution", "Solution"],
  ["results", "Results"],
] as const;

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    const moved = await findRedirect(`/projects/${slug}`);
    if (moved) permanentRedirect(moved.destination);
    notFound();
  }

  const facts = [
    ["Client", project.clientName],
    ["Industry", project.industry],
    ["Location", project.location],
    ["Year", project.year ? String(project.year) : null],
    ["Division", project.division?.title ?? null],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950">
        {project.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={project.heroImage.secureUrl}
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
            <Link href="/projects" className="hover:text-white">
              Projects
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">{project.title}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {project.title}
          </h1>
          {project.scope && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-200">
              {project.scope}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-10">
            {NARRATIVE.map(([key, label]) =>
              project[key] ? (
                <div key={key}>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                    {label}
                  </h2>
                  <div className="prose-measure mt-3 space-y-4">
                    {project[key]!.split(/\n{2,}/).map((paragraph, i) => (
                      <p key={i} className="leading-relaxed text-steel-800">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null,
            )}

            {project.gallery.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                  Gallery
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {project.gallery.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg border border-brand-100 bg-surface"
                    >
                      <Image
                        src={entry.media.secureUrl}
                        alt={entry.media.alt ?? ""}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {facts.length > 0 && (
              <dl className="divide-y divide-brand-100 rounded-lg border border-brand-100 bg-surface p-6">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                      {label}
                    </dt>
                    <dd className="text-right text-sm font-medium text-brand-900">
                      {label === "Division" && project.division ? (
                        <Link
                          href={`/divisions/${project.division.slug}`}
                          className="hover:text-accent-600"
                        >
                          {value}
                        </Link>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="rounded-lg bg-brand-950 p-6">
              <h2 className="font-display text-lg font-bold text-white">
                Similar scope?
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
