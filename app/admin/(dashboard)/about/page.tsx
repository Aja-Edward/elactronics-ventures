import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "About content" };

/**
 * Hub for the seven entities behind the public About pages.
 *
 * They get one entry in the admin nav rather than seven: the header holds ten
 * links already, and these belong together — each one is a section of About.
 * Counts are shown here so an editor can see at a glance which public page is
 * still empty, which is the whole reason this section exists.
 */
export default async function AboutAdminPage() {
  const [team, history, entities, locations, awards, clients, faqs] = await Promise.all([
    db.teamMember.groupBy({ by: ["status"], _count: true }),
    db.historyMilestone.groupBy({ by: ["status"], _count: true }),
    db.groupEntity.groupBy({ by: ["status"], _count: true }),
    db.location.groupBy({ by: ["status"], _count: true }),
    db.award.groupBy({ by: ["status"], _count: true }),
    db.client.groupBy({ by: ["status"], _count: true }),
    db.faq.groupBy({ by: ["status"], _count: true }),
  ]);

  type Grouped = { status: string; _count: number }[];

  const tally = (rows: Grouped) => ({
    total: rows.reduce((sum, row) => sum + row._count, 0),
    published: rows.find((row) => row.status === "PUBLISHED")?._count ?? 0,
  });

  const sections = [
    {
      href: "/admin/about/team",
      title: "Board & leadership",
      blurb: "People shown on the Our Governance page.",
      page: "/about/governance",
      counts: tally(team),
    },
    {
      href: "/admin/about/history",
      title: "Company history",
      blurb: "Milestones on the Our History timeline.",
      page: "/about/history",
      counts: tally(history),
    },
    {
      href: "/admin/about/group-entities",
      title: "Group entities",
      blurb: "Companies making up the group.",
      page: "/about/group-entities",
      counts: tally(entities),
    },
    {
      href: "/admin/about/locations",
      title: "Locations",
      blurb: "Offices and operating bases.",
      page: "/about/locations",
      counts: tally(locations),
    },
    {
      href: "/admin/about/awards",
      title: "Awards & recognition",
      blurb: "Awards from clients and industry bodies.",
      page: "/about/awards",
      counts: tally(awards),
    },
    {
      href: "/admin/about/clients",
      title: "Clients",
      blurb: "Operators and contractors on the client wall.",
      page: "/about/clients",
      counts: tally(clients),
    },
    {
      href: "/admin/about/faqs",
      title: "FAQs",
      blurb: "Questions grouped by category.",
      page: "/about/faqs",
      counts: tally(faqs),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          About content
        </h1>
        <p className="mt-1 text-sm text-steel-700">
          Each section below fills one page under About on the public site. A
          page with nothing published shows a placeholder instead.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex h-full flex-col rounded-lg border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
            >
              <p className="font-display text-base font-semibold text-brand-900">
                {section.title}
              </p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-steel-700">
                {section.blurb}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide">
                {section.counts.total === 0 ? (
                  <span className="text-accent-700">Nothing added yet</span>
                ) : (
                  <span className="text-steel-600">
                    {section.counts.published} of {section.counts.total} published
                  </span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
