import type { Metadata } from "next";
import Link from "next/link";

import ContactForm from "./ContactForm";
import { getSiteSettings, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Elatronics Ventures for engineering, construction, maintenance and inspection services.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const site = await getSiteSettings();
  const wa = whatsappHref(site.whatsapp);
  const address = [site.addressLine, site.city, site.state, site.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Tell us what you need and we will get back to you.
          </p>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              For pricing on a defined scope, the{" "}
              <Link href="/request-quote" className="font-semibold text-brand-900 underline">
                quote request form
              </Link>{" "}
              captures more detail and reaches us faster.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-brand-100 bg-white p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                Direct
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {site.phone && (
                  <div>
                    <dt className="text-xs text-steel-500">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${site.phone.replace(/\s/g, "")}`}
                        className="font-medium text-brand-900 hover:text-accent-600"
                      >
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {wa && (
                  <div>
                    <dt className="text-xs text-steel-500">WhatsApp</dt>
                    <dd>
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-900 hover:text-accent-600"
                      >
                        {site.whatsapp}
                      </a>
                    </dd>
                  </div>
                )}
                {site.email && (
                  <div>
                    <dt className="text-xs text-steel-500">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${site.email}`}
                        className="break-words font-medium text-brand-900 hover:text-accent-600"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                )}
                {address && (
                  <div>
                    <dt className="text-xs text-steel-500">Address</dt>
                    <dd className="leading-relaxed text-steel-800">{address}</dd>
                  </div>
                )}
                {site.workingHours && (
                  <div>
                    <dt className="text-xs text-steel-500">Hours</dt>
                    <dd className="text-steel-800">{site.workingHours}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
