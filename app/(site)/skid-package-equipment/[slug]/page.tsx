import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

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
      <section className="relative overflow-hidden bg-brand-950">
        {system.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={system.heroImage.secureUrl}
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
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <Link href="/skid-package-equipment" className="hover:text-white">
              Skid Package Equipment
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">{system.title}</span>
          </nav>

          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {system.title}
          </h1>
          {system.summary && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-200">
              {system.summary}
            </p>
          )}
        </div>
      </section>

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
