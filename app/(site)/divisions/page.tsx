import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/components/site/PageHero";
import { getDefaultBanner } from "@/lib/hero";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getPublishedDivisions,
  type DivisionCategory,
} from "@/lib/divisions";
import { MIN_CARD_WIDTH, bigEnough } from "@/lib/images";

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

  // Only queried when a card actually needs it, so the common case where every
  // division has a usable photograph costs nothing. A card with no image at all
  // used to render as text with a ragged edge against its neighbours; falling
  // back keeps the grid even.
  const needsFallback = divisions.some(
    (d) => !bigEnough(d.heroImage, MIN_CARD_WIDTH),
  );
  const fallbackImage = needsFallback ? await getDefaultBanner() : null;

  return (
    <>
      <PageHero
        title="Divisions"
        eyebrow="What we do"
        intro="Each division operates as a dedicated capability, drawing on shared engineering, HSE and project controls."
      />

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
                {group.items.map((division) => {
                  // A thumbnail set as the division's banner would be blown up
                  // three or four times over in this card. Refuse it and use
                  // the site's own image instead.
                  const image =
                    bigEnough(division.heroImage, MIN_CARD_WIDTH) ?? fallbackImage;

                  return (
                  <Link
                    key={division.id}
                    href={`/divisions/${division.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-brand-100 bg-white transition-colors hover:border-brand-300"
                  >
                    {image && (
                      <div className="relative aspect-[16/9] bg-surface">
                        <Image
                          src={image.secureUrl}
                          alt={image.alt ?? ""}
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
                  );
                })}
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
