import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { getPageBySlug } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Who we are, how we are governed, and the standards we work to at Elatronics Ventures.",
  alternates: { canonical: "/about" },
};

/**
 * The About hub.
 *
 * This used to be one long page with seven anchored sections. Each of those is
 * now its own route, mirroring the reference site, so this page carries the
 * editorial introduction and hands off to them. The introduction still comes
 * from the Page row with slug "about".
 */
const SECTIONS = [
  {
    href: "/about/governance",
    title: "Our Governance",
    blurb: "The board and leadership team accountable for how we operate.",
  },
  {
    href: "/about/history",
    title: "Our History",
    blurb: "The milestones behind the business, from incorporation to today.",
  },
  {
    href: "/about/group-entities",
    title: "Group Entities",
    blurb: "The companies that make up the group and what each one does.",
  },
  {
    href: "/about/locations",
    title: "Global Locations",
    blurb: "The offices and operating bases we work from.",
  },
  {
    href: "/about/awards",
    title: "Awards & Recognitions",
    blurb: "Recognition from clients, partners and industry bodies.",
  },
  {
    href: "/certifications",
    title: "Our Certifications",
    blurb: "Independent accreditation of our management systems.",
  },
  {
    href: "/about/clients",
    title: "Clients",
    blurb: "The operators and contractors we deliver for.",
  },
  {
    href: "/about/faqs",
    title: "FAQs",
    blurb: "Answers to what we are asked most often.",
  },
];

export default async function AboutPage() {
  const [site, page] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("about"),
  ]);

  const intro =
    page?.body ??
    page?.description ??
    `${site.companyName} provides integrated engineering, construction, maintenance and inspection services to the energy and industrial sectors in ${site.country ?? "Nigeria"}.`;

  return (
    <>
      <PageHero
        // Loaded above, so pass the banner rather than making PageHero fetch
        // the same Page row again.
        image={page?.heroImage}
        title={page?.title ?? "About Us"}
        crumb="About Us"
        intro={page?.description ?? undefined}
      />

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Who we are
            </h2>
            <div className="prose-measure mt-4 space-y-4">
              {intro.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-steel-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <dl className="divide-y divide-brand-100 rounded-lg border border-brand-100 bg-surface p-6 text-sm">
              {[
                ["Company", site.companyName],
                ["Head office", [site.city, site.state].filter(Boolean).join(", ")],
                ["Country", site.country],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([label, value]) => (
                  <div
                    key={label as string}
                    className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-brand-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* Hand-off to the rest of About. The dropdown is not the only way in:
          anyone who lands on /about from search needs these links too. */}
      <section className="border-t border-brand-100 bg-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
            More about us
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="flex h-full flex-col rounded-lg border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
                >
                  <p className="font-display text-base font-semibold text-brand-900">
                    {section.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-steel-700">
                    {section.blurb}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
