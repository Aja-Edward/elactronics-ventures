import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedCertifications } from "@/lib/certifications";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Accreditations and certifications held by Elatronics Ventures across quality, safety, environmental and industry-specific standards.",
  alternates: { canonical: "/certifications" },
};

export default async function CertificationsPage() {
  const certifications = await getPublishedCertifications();

  return (
    <>
      {/* Breadcrumb hero, matching the reference site's structure. */}
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Certifications</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Our Certifications
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Independent accreditation of our quality, safety and environmental
            management systems, alongside the industry registrations required to
            operate.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {certifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-12 text-center">
              <p className="text-sm text-steel-700">
                Certifications will be listed here shortly.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {certifications.map((cert) => {
                // `lapsed` comes from the cached data layer (lib/certifications).
                // A lapsed certificate must not be presented as current: the
                // admin flags it, and the public page omits the validity date
                // rather than advertising an expired accreditation.
                return (
                  <li
                    key={cert.id}
                    className="flex flex-col overflow-hidden rounded-lg border border-brand-100 bg-white"
                  >
                    <div className="relative flex aspect-square items-center justify-center bg-surface p-5">
                      {cert.file ? (
                        <Image
                          src={cert.file.secureUrl}
                          alt={cert.file.alt || cert.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          // contain, not cover: certificates and body logos
                          // arrive in wildly different aspect ratios and must
                          // never be cropped.
                          className="object-contain p-4"
                        />
                      ) : (
                        <span className="px-3 text-center font-display text-sm font-semibold text-steel-500">
                          {cert.issuer ?? cert.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col border-t border-brand-100 p-4">
                      <h2 className="font-display text-sm font-semibold leading-snug text-brand-900">
                        {cert.name}
                      </h2>
                      {cert.issuer && (
                        <p className="mt-1 text-xs text-steel-600">{cert.issuer}</p>
                      )}
                      {cert.reference && (
                        <p className="mt-1 font-mono text-[11px] text-steel-500">
                          {cert.reference}
                        </p>
                      )}
                      {cert.expiresAt && !cert.lapsed && (
                        <p className="mt-auto pt-2 text-[11px] text-steel-500 tabular-nums">
                          Valid to{" "}
                          {cert.expiresAt.toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
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
              Need certification documents for a tender?
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              We can provide current copies on request.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
