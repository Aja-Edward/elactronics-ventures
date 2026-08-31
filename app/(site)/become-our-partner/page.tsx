import type { Metadata } from "next";
import Link from "next/link";

import PartnerForm from "./PartnerForm";
import PageHero from "@/components/site/PageHero";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Become our Partner",
  description:
    "Manufacturers, distributors and subcontractors: apply to partner with Elatronics Ventures in the West African energy and industrial market.",
  alternates: { canonical: "/become-our-partner" },
};

export default async function BecomeOurPartnerPage() {
  const site = await getSiteSettings();

  return (
    <>
      <PageHero
        title="Become our Partner"
        intro="We work with manufacturers, distributors and specialist subcontractors who want representation in this market."
      />

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <PartnerForm />
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-brand-100 bg-white p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                What happens next
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-steel-800">
                {[
                  "We review your details against the divisions we operate.",
                  "Our commercial team comes back with any questions.",
                  "Where there is a fit, we agree terms and an authorisation.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-900 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg bg-brand-950 p-6">
              <h2 className="font-display text-base font-bold text-white">
                Already represent us?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">
                Our current authorisations are listed on the OEM page.
              </p>
              <Link
                href="/oem"
                className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-80"
              >
                View our OEMs
              </Link>
              {site.email && (
                <p className="mt-4 border-t border-brand-800 pt-4 text-sm">
                  <a
                    href={`mailto:${site.email}`}
                    className="text-brand-200 transition-colors hover:text-white"
                  >
                    {site.email}
                  </a>
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
