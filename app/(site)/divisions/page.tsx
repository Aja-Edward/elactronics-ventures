import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getPublishedDivisions,
  type DivisionCategory,
} from "@/lib/divisions";

export const metadata: Metadata = {
  title: "Divisions",
  description:
    "Engineering, construction, maintenance, inspection and specialist service divisions across the energy and industrial sectors.",
};

export default async function DivisionsIndexPage() {
  const divisions = await getPublishedDivisions();

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: divisions.filter((d) => d.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-300">
            What we do
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Divisions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-200">
            Each division operates as a dedicated capability, drawing on shared
            engineering, HSE and project controls.
          </p>
        </div>
      </section>

      {grouped.length === 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm text-steel-700">
              No divisions are published yet.
            </p>
          </div>
        </section>
      ) : (
        grouped.map((group, index) => (
          <section
            key={group.category}
            className={index % 2 === 0 ? "bg-white py-16" : "bg-surface py-16"}
          >
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                {CATEGORY_LABEL[group.category as DivisionCategory]}
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((division) => (
                  <Link
                    key={division.id}
                    href={`/divisions/${division.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-brand-100 bg-white transition-colors hover:border-brand-300"
                  >
                    {division.heroImage && (
                      <div className="relative aspect-[16/9] bg-surface">
                        <Image
                          src={division.heroImage.secureUrl}
                          alt={division.heroImage.alt ?? ""}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-brand-900 group-hover:text-accent-600">
                        {division.title}
                      </h3>
                      {division.summary && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-700">
                          {division.summary}
                        </p>
                      )}
                      <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent-600">
                        Learn more
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <section className="border-t border-brand-100 bg-surface py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Not sure which division you need?
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              Describe the scope and we will route it to the right team.
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
