import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import { getOemPartners } from "@/lib/oem";

export const metadata: Metadata = {
  title: "OEM Partnerships & Authorisations",
  description:
    "Original equipment manufacturers Elatronics Ventures is authorised to represent, supply and support.",
  alternates: { canonical: "/oem" },
};

/** Locale-stable, and only ever shows a year+month — the day is noise here. */
function formatUntil(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function OemPage() {
  const partners = await getOemPartners();

  return (
    <>
      <PageHero
        pageSlug="oem"
        title="Our Partnerships and Authorisations"
        crumb="OEM"
        intro="The manufacturers we are authorised to represent, supply and support across West Africa."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {partners.length === 0 ? (
            <EmptyNotice>
              Our OEM authorisations will be published here shortly.
            </EmptyNotice>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner: (typeof partners)[number]) => {
                const until = formatUntil(partner.authorisedUntil);

                return (
                  <li
                    key={partner.id}
                    className="flex flex-col rounded-lg border border-brand-100 bg-white p-6"
                  >
                    {partner.logo ? (
                      <span className="relative block h-12 w-full max-w-[180px]">
                        <Image
                          src={partner.logo.secureUrl}
                          alt={partner.logo.alt || partner.name}
                          fill
                          sizes="180px"
                          className="object-contain object-left"
                        />
                      </span>
                    ) : null}

                    <h2 className="mt-4 font-display text-lg font-semibold leading-snug text-brand-900">
                      {partner.name}
                    </h2>

                    {partner.country && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-steel-500">
                        {partner.country}
                      </p>
                    )}

                    {partner.description && (
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-700">
                        {partner.description}
                      </p>
                    )}

                    {/* The authorisation reference and its expiry are the part
                        a buyer actually checks, so they are stated rather than
                        left as an internal record. */}
                    {(partner.authorisationRef || until) && (
                      <p className="mt-4 text-xs text-steel-500">
                        {[
                          partner.authorisationRef && `Ref ${partner.authorisationRef}`,
                          until && `Valid to ${until}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent-600 transition-colors hover:text-accent-700"
                      >
                        Visit manufacturer
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-brand-100 bg-surface py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Manufacture equipment we should be representing?
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              We are always open to new authorisations in this market.
            </p>
          </div>
          <Link
            href="/become-our-partner"
            className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
          >
            Become our Partner
          </Link>
        </div>
      </section>
    </>
  );
}
