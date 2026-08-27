import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/db";
import { getPageBySlug } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Who we are, how we are governed, and the standards we work to at Elatronics Ventures.",
  alternates: { canonical: "/about" },
};

/**
 * Assembled from the entities that already exist rather than a hand-written
 * page: leadership, history and awards are each editable in their own admin
 * screen, and each section simply disappears when it has nothing published.
 * The editorial intro lives in a Page row with slug "about".
 */
async function getAboutData() {
  "use cache";
  const { cacheLife, cacheTag } = await import("next/cache");
  cacheTag("about-page");
  cacheLife("days");

  const [team, milestones, awards, entities, locations, clients, faqs] = await Promise.all([
    db.teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isBoard: "desc" }, { order: "asc" }],
      select: {
        id: true, name: true, role: true, bio: true, isBoard: true,
        photo: { select: { secureUrl: true, alt: true } },
      },
    }),
    db.historyMilestone.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ year: "asc" }, { order: "asc" }],
      select: { id: true, year: true, title: true, description: true },
    }),
    db.award.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ year: "desc" }, { order: "asc" }],
      select: { id: true, title: true, awardedBy: true, year: true },
    }),
    db.groupEntity.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true, website: true },
    }),
    db.location.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isHeadOffice: "desc" }, { order: "asc" }],
      select: { id: true, name: true, city: true, state: true, country: true, addressLine: true, phone: true, email: true, isHeadOffice: true },
    }),
    db.client.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, name: true, sector: true, logo: { select: { secureUrl: true, alt: true } } },
    }),
    db.faq.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    }),
  ]);

  return { team, milestones, awards, entities, locations, clients, faqs };
}

export default async function AboutPage() {
  const [site, page, data] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("about"),
    getAboutData(),
  ]);

  const intro =
    page?.body ??
    page?.description ??
    `${site.companyName} provides integrated engineering, construction, maintenance and inspection services to the energy and industrial sectors in ${site.country ?? "Nigeria"}.`;

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {page?.title ?? "About Us"}
          </h1>
          {page?.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
              {page.description}
            </p>
          )}
        </div>
      </section>

      {/* Who we are */}
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
                  <div key={label as string} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-brand-900">{value}</dd>
                  </div>
                ))}
            </dl>
            <Link
              href="/certifications"
              className="block rounded-lg border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
            >
              <p className="font-display text-base font-semibold text-brand-900">
                Our certifications
              </p>
              <p className="mt-1 text-sm text-steel-700">
                Independent accreditation of our management systems.
              </p>
            </Link>
          </aside>
        </div>
      </section>

      {/* History — only when milestones exist */}
      {data.milestones.length > 0 && (
        <section id="history" className="scroll-mt-24 bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Our history
            </h2>
            <ol className="mt-8 space-y-6 border-l border-brand-200 pl-6">
              {data.milestones.map((m) => (
                <li key={m.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-accent-600"
                  />
                  <p className="font-display text-lg font-bold text-brand-900 tabular-nums">
                    {m.year}
                  </p>
                  <p className="mt-0.5 font-medium text-brand-900">{m.title}</p>
                  {m.description && (
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-steel-700">
                      {m.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Governance */}
      {data.team.length > 0 && (
        <section id="governance" className="scroll-mt-24 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Governance &amp; leadership
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.team.map((member) => (
                <li
                  key={member.id}
                  className="overflow-hidden rounded-lg border border-brand-100 bg-white"
                >
                  <div className="relative aspect-[4/5] bg-surface">
                    {member.photo && (
                      <Image
                        src={member.photo.secureUrl}
                        alt={member.photo.alt || member.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-display text-base font-semibold text-brand-900">
                      {member.name}
                    </p>
                    <p className="mt-0.5 text-sm text-accent-600">{member.role}</p>
                    {member.bio && (
                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-steel-700">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Group entities */}
      {data.entities.length > 0 && (
        <section id="group-entities" className="scroll-mt-24 bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Group entities
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.entities.map((entity) => (
                <li key={entity.id} className="rounded-lg border border-brand-100 bg-white p-5">
                  <p className="font-display text-base font-semibold text-brand-900">
                    {entity.name}
                  </p>
                  {entity.description && (
                    <p className="mt-2 text-sm leading-relaxed text-steel-700">
                      {entity.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Awards */}
      {data.awards.length > 0 && (
        <section id="awards" className="scroll-mt-24 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Awards &amp; recognition
            </h2>
            <ul className="mt-6 divide-y divide-brand-100 border-y border-brand-100">
              {data.awards.map((award) => (
                <li key={award.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span className="font-medium text-brand-900">{award.title}</span>
                  <span className="text-sm text-steel-600 tabular-nums">
                    {[award.awardedBy, award.year].filter(Boolean).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Locations */}
      {data.locations.length > 0 && (
        <section id="locations" className="scroll-mt-24 bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Our locations
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.locations.map((loc) => (
                <li key={loc.id} className="rounded-lg border border-brand-100 bg-white p-5">
                  <p className="font-display text-base font-semibold text-brand-900">
                    {loc.name}
                    {loc.isHeadOffice && (
                      <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
                        Head office
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-steel-700">
                    {[loc.addressLine, loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
                  </p>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="mt-2 block text-sm font-medium text-brand-900 hover:text-accent-600"
                    >
                      {loc.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Clients */}
      {data.clients.length > 0 && (
        <section id="clients" className="scroll-mt-24 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Clients
            </h2>
            <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
              {data.clients.map((client) => (
                <li key={client.id}>
                  {client.logo ? (
                    <span className="relative block h-12 w-32">
                      <Image
                        src={client.logo.secureUrl}
                        alt={client.logo.alt || client.name}
                        fill
                        sizes="128px"
                        className="object-contain object-left"
                      />
                    </span>
                  ) : (
                    <span className="font-display text-base font-semibold text-brand-900">
                      {client.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ — native details/summary, so it works without JavaScript and is
          keyboard-accessible without any extra wiring. */}
      {data.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 bg-surface py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Frequently asked questions
            </h2>
            <div className="mt-8 divide-y divide-brand-100 border-y border-brand-100">
              {data.faqs.map((faq) => (
                <details key={faq.id} className="group py-4">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 font-medium text-brand-900 marker:content-['']">
                    {faq.question}
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-steel-500 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-steel-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-brand-100 bg-surface py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
              Work with us
            </h2>
            <p className="mt-1 text-sm text-steel-700">
              Tell us about your scope and we will come back with a quote.
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
