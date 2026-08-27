import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedEquipment } from "@/lib/equipment";

export const metadata: Metadata = {
  title: "Our Equipment",
  description:
    "Owned plant and equipment available for deployment, including specifications and quantities held.",
  alternates: { canonical: "/equipment" },
};

export default async function EquipmentPage() {
  const equipment = await getPublishedEquipment();

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Our Equipment</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Our Equipment
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Plant we own and operate directly, available for deployment without
            third-party hire.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {equipment.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-12 text-center">
              <p className="text-sm text-steel-700">
                Our equipment register will be listed here shortly.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-brand-100 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-surface">
                    {item.image ? (
                      <Image
                        src={item.image.secureUrl}
                        alt={item.image.alt || item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-4 text-center text-xs font-semibold uppercase tracking-wide text-steel-400">
                        {item.category ?? "Equipment"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-base font-semibold leading-snug text-brand-900">
                        {item.name}
                      </h2>
                      {/* Quantity is an ownership claim, so it is stated
                          plainly rather than implied by the photograph. */}
                      {item.quantity != null && item.quantity > 1 && (
                        <span className="shrink-0 rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-800 tabular-nums">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-steel-700">
                        {item.description}
                      </p>
                    )}

                    {item.specs.length > 0 && (
                      <dl className="mt-4 divide-y divide-brand-50 border-t border-brand-50 text-sm">
                        {item.specs.map((spec) => (
                          <div
                            key={spec.label}
                            className="flex justify-between gap-3 py-1.5"
                          >
                            <dt className="text-steel-600">{spec.label}</dt>
                            <dd className="text-right font-medium text-brand-900 tabular-nums">
                              {spec.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-brand-100 bg-surface py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Need a specific unit on site?
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              Tell us the scope and we will confirm availability.
            </p>
          </div>
          <Link
            href="/request-quote"
            className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
