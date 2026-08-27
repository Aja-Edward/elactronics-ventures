import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Counts are read live, without `use cache` — the admin must always see the
 * true current state, never a cached view of it. Caching belongs on the public
 * side, where traffic is high and staleness is briefly tolerable.
 */
async function getCounts() {
  const [divisions, published, equipment, projects, media, quotes] =
    await Promise.all([
      db.division.count(),
      db.division.count({ where: { status: "PUBLISHED" } }),
      db.equipment.count(),
      db.project.count(),
      db.media.count(),
      db.quoteRequest.count({ where: { status: "NEW" } }),
    ]);

  return { divisions, published, equipment, projects, media, quotes };
}

export default async function AdminDashboard() {
  const [user, counts] = await Promise.all([getCurrentUser(), getCounts()]);

  const cards = [
    { label: "Divisions", value: `${counts.published}/${counts.divisions}`, hint: "published / total", href: "/admin/divisions" },
    { label: "Equipment", value: counts.equipment, hint: "items in register", href: "/admin/equipment" },
    { label: "Projects", value: counts.projects, hint: "case studies", href: "/admin/projects" },
    { label: "Media", value: counts.media, hint: "files uploaded", href: "/admin/media" },
    { label: "New quote requests", value: counts.quotes, hint: "awaiting response", href: "/admin/quotes" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-steel-700">
          Content published here appears on the public site immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-lg border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-900 tabular-nums">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-steel-500">{card.hint}</p>
          </Link>
        ))}
      </div>

      {/* Honest about what is not built yet, rather than dead links that look
          broken. Each becomes a real screen as it lands. */}
      <div className="rounded-lg border border-dashed border-brand-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-brand-900">
          Still to build
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-steel-700">
          <li>Media library with Cloudinary uploads</li>
          <li>Division editor, then equipment and projects</li>
          <li>Site settings and SEO defaults</li>
          <li>Quote request inbox</li>
        </ul>
      </div>
    </div>
  );
}
