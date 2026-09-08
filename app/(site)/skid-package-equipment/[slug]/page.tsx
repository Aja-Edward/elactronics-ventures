import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { findRedirect } from "@/lib/redirects";
import {
  getSkidPackageServiceBySlug,
  getSkidPackageServiceSlugs,
} from "@/lib/services";

// Reads params, which is per-request data, so this route blocks rather than
// prerendering a shell. The page body is still cached under the service's own
// tag, so the database is hit once per invalidation, not once per visitor.
export const instant = false;

/**
 * Sentinel when empty — Cache Components requires at least one entry, and an
 * unpublished last system must not break the next deploy. The sentinel
 * prerenders as a 404 and is linked from nowhere.
 */
export async function generateStaticParams() {
  const slugs = await getSkidPackageServiceSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/skid-package-equipment/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const system = await getSkidPackageServiceBySlug(slug);

  if (!system) return { title: "Not found", robots: { index: false } };

  return {
    title: system.seoTitle || system.title,
    description: system.seoDescription || system.summary || undefined,
    alternates: { canonical: `/skid-package-equipment/${system.slug}` },
    openGraph: {
      title: system.seoTitle || system.title,
      description: system.seoDescription || system.summary || undefined,
      type: "article",
      images: system.heroImage
        ? [{ url: system.heroImage.secureUrl, alt: system.heroImage.alt ?? "" }]
        : undefined,
    },
  };
}

export default async function SkidPackageSystemPage({
  params,
}: PageProps<"/skid-package-equipment/[slug]">) {
  const { slug } = await params;
  const system = await getSkidPackageServiceBySlug(slug);

  if (!system) {
    const moved = await findRedirect(`/skid-package-equipment/${slug}`);
    if (moved) permanentRedirect(moved.destination);

    // Covers both "does not exist" and "exists but is a draft" — an
    // unpublished system must be indistinguishable from a missing one.
    notFound();
  }

  return (
    <>
      <PageHero
        title={system.title}
        intro={system.summary ?? undefined}
        trail={[
          { label: "Skid Package Equipment", href: "/skid-package-equipment" },
        ]}
        image={system.heroImage}
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {system.body ? (
            // Stored as plain text today, exactly as division bodies are.
            <div className="prose-measure space-y-4">
              {system.body.split(/\n{2,}/).map((paragraph, i) => (
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

          <Link
            href="/skid-package-equipment"
            className="mt-10 inline-block text-xs font-semibold uppercase tracking-wide text-accent-600 transition-colors hover:text-accent-700"
          >
            ← All skid package systems
          </Link>
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
