import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { getPageBySlug } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Who we are, how we are governed, and the standards we work to at Elatronics Ventures.",
  alternates: { canonical: "/about" },
};

/**
 * The About hub.
 *
 * This used to be one long page with seven anchored sections. Each of those is
 * now its own route, mirroring the reference site, so this page carries the
 * editorial introduction and hands off to them. The introduction still comes
 * from the Page row with slug "about".
 */
const SECTIONS = [
  {
    href: "/about/governance",
    title: "Our Governance",
    blurb: "The board and leadership team accountable for how we operate.",
  },
  {
    href: "/about/history",
    title: "Our History",
    blurb: "The milestones behind the business, from incorporation to today.",
  },
  {
    href: "/about/group-entities",
    title: "Group Entities",
    blurb: "The companies that make up the group and what each one does.",
  },
  {
    href: "/about/locations",
    title: "Global Locations",
    blurb: "The offices and operating bases we work from.",
  },
  {
    href: "/about/awards",
    title: "Awards & Recognitions",
    blurb: "Recognition from clients, partners and industry bodies.",
  },
  {
    href: "/certifications",
    title: "Our Certifications",
    blurb: "Independent accreditation of our management systems.",
  },
  {
    href: "/about/clients",
    title: "Clients",
    blurb: "The operators and contractors we deliver for.",
  },
  {
    href: "/about/faqs",
    title: "FAQs",
    blurb: "Answers to what we are asked most often.",
  },
];

export default async function AboutPage() {
  const [site, page] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("about"),
  ]);

  const intro =
    page?.body ??
    page?.description ??
    `${site.companyName} – Company Profile

Elatronics Ventures is recognized as one of the leading Engineering, Procurement, and Construction (EPC) contractors operating across Africa. We provide innovative engineering and infrastructure solutions in the Oil & Gas (Midstream), Water Treatment, Renewable Energy, Power, Food & Beverage, and Industrial Plant sectors.

Elatronics Ventures delivers a comprehensive range of services tailored to meet the diverse needs of our clients. Our core capabilities include engineering design, project management, procurement, construction and supervision, commissioning and start-up, as well as operations and maintenance (O&M) services.

Headquartered in Nigeria, Elatronics Ventures has established a growing presence across Africa through strategic subsidiaries and partnerships in Ghana, Mozambique, Côte d'Ivoire, Uganda, and Kenya**, enabling us to execute projects efficiently across the continent.

Over the past 20 years, Elatronics Ventures has built a strong reputation for successfully delivering complex engineering projects. Our proven track record spans Engineering, EPCIM (Engineering, Procurement, Construction, Installation, and Management) turnkey projects, inspection services, operations and maintenance, marine support services, and the representation of leading Original Equipment Manufacturers (OEMs).

Elatronics Ventures is also a specialized process engineering company that designs and builds a wide range of modular wellsite production systems for the Upstream Oil & Gas, Midstream Oil & Gas, Downstream Refining, and Power Generation** industries. Our modular systems are skid-mounted, factory-tested, and designed for rapid installation using a plug-and-play approach. We develop customized solutions that meet each client's exact technical specifications and provide installation and commissioning services for projects anywhere in the world.

Through our global network of OEM manufacturing partners, Elatronics Ventures has access to world-class fabrication and assembly facilities capable of delivering sophisticated engineering packages. Our manufacturing capabilities support large-scale projects, including:

* Early Production Units (EPU)
* Modular Production Packages
* Chemical and Methanol Injection Skid Packages
* Metering Skids
* Compressor Skids
* Control Panels and Integrated Control Systems
* Filtration Skid Packages
* Dehydration Skids
* Lube Oil Skids
* Multiphase Flow Meter Skids
* Chemical Transfer Packages
* Modular Wellsite Packages (MWP)
* Early Production Facilities (EPF)
* Nitrogen Generation System Packages
* Oil Pipeline Pump Packages
* Heavy Oil Pipeline Packages
* Fuel Gas Conditioning Packages
* Fuel Gas Conditioning Membrane Packages
* Heat Transfer and Hot Oil Packages
* Production Sand Removal Packages
* Produced Water Injection Packages
* Loading Arm Skid Packages
* Integration and Industrial Automation Assemblies

At Elatronics Ventures, quality is at the heart of everything we do. Our commitment to meeting stringent industry regulations and client specifications enables us to consistently deliver projects that comply with internationally accepted engineering and quality standards.

Elatronics Ventures is fully committed to internationally recognized Quality, Health, Safety, and Environmental (QHSE) standards, including ISO-compliant management systems, in the execution of every project. We apply globally accepted project management methodologies to ensure that every assignment is delivered safely, efficiently, on schedule, and in full compliance with agreed contractual and regulatory standards.
 ${site.country ?? "Nigeria"}.`;

  return (
    <>
      <PageHero
        // Loaded above, so pass the banner rather than making PageHero fetch
        // the same Page row again.
        image={page?.heroImage}
        title={page?.title ?? "About Us"}
        crumb="About Us"
        intro={page?.description ?? undefined}
      />

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
                  <div
                    key={label as string}
                    className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-brand-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* Hand-off to the rest of About. The dropdown is not the only way in:
          anyone who lands on /about from search needs these links too. */}
      <section className="border-t border-brand-100 bg-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
            More about us
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="flex h-full flex-col rounded-lg border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
                >
                  <p className="font-display text-base font-semibold text-brand-900">
                    {section.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-steel-700">
                    {section.blurb}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
