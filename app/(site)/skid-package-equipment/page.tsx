import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { getSkidPackageServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Skid Package Equipment",
  description:
    "Custom engineered skid-mounted modular process systems for midstream and downstream oil and gas, power generation and water treatment.",
  alternates: { canonical: "/skid-package-equipment" },
};

/**
 * The skid-package systems are their own section rather than a division: they
 * are a manufacturing capability, and the reference site gives them a
 * top-level menu entry of their own for the same reason.
 */
export default async function SkidPackageEquipmentPage() {
  const systems = await getSkidPackageServices();

  return (
    <>
      <PageHero
        title="Skid Package Equipment"
        intro="Custom engineered, skid-mounted modular process systems — designed, built, tested and delivered as a single package."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="prose-measure space-y-4 text-steel-800">
            <p className="leading-relaxed">
              A skid package puts an entire process system — vessels, pumps,
              piping, instrumentation and controls — onto one structural frame,
              assembled and function-tested before it leaves the yard. It
              shortens site work to a set of tie-ins, which is what makes it the
              practical option for remote and offshore locations.
            </p>
            <p className="leading-relaxed">
              We take a package from concept through detail design, fabrication
              and factory acceptance testing to installation and commissioning
              support, working with our OEM partners where a proprietary
              component is specified.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Systems we package
            </h2>

            {systems.length === 0 ? (
              <div className="mt-6">
                <EmptyNotice>
                  Our skid-package systems will be published here shortly.
                </EmptyNotice>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {systems.map((system: (typeof systems)[number]) => (
                  <Link
                    key={system.id}
                    href={`/skid-package-equipment/${system.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-brand-100 bg-white transition-colors hover:border-brand-300"
                  >
                    {system.heroImage && (
                      <div className="relative aspect-[16/9] bg-surface">
                        <Image
                          src={system.heroImage.secureUrl}
                          alt={system.heroImage.alt ?? ""}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-brand-900 group-hover:text-accent-600">
                        {system.title}
                      </h3>
                      {system.summary && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-700">
                          {system.summary}
                        </p>
                      )}
                      <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent-600">
                        Learn more
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
