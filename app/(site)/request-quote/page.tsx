import type { Metadata } from "next";
import Link from "next/link";

import QuoteForm from "./QuoteForm";
import { getPublishedDivisions } from "@/lib/divisions";
import { getSiteSettings, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Submit your scope of work and receive a quote from Elatronics Ventures for engineering, construction, maintenance or inspection services.",
  alternates: { canonical: "/request-quote" },
};

export default async function RequestQuotePage() {
  const [divisions, site] = await Promise.all([
    getPublishedDivisions(),
    getSiteSettings(),
  ]);

  const wa = whatsappHref(site.whatsapp);

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Request a Quote</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Request a Quote
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Tell us the scope and we will come back with pricing and a proposed
            approach.
          </p>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <QuoteForm divisions={divisions.map((d) => d.title)} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-brand-100 bg-white p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                What happens next
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-steel-800">
                {[
                  "We review the scope and confirm we have what we need.",
                  "We come back with any clarifying questions.",
                  "You receive a written quote and proposed approach.",
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
                Need it urgently?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">
                Call or message us directly rather than waiting on the form.
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                {site.phone && (
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="block font-medium text-white hover:text-steel-300"
                  >
                    {site.phone}
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-medium text-white hover:text-steel-300"
                  >
                    WhatsApp {site.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
