import type { Metadata } from "next";
import Link from "next/link";

import DivisionRow, { type DivisionSummary } from "./DivisionRow";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Divisions" };

export default async function DivisionsPage() {
  const user = await getCurrentUser();

  const rows = await db.division.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      order: true,
      _count: { select: { projects: true, services: true } },
    },
  });

  const divisions: DivisionSummary[] = rows.map((r: (typeof rows)[number]) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    status: r.status,
    order: r.order,
    linked: r._count.projects + r._count.services,
  }));

  const published = divisions.filter((d) => d.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            Divisions
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            {published} of {divisions.length} published. Changes appear on the
            public site immediately.
          </p>
        </div>
        <Link
          href="/admin/divisions/new"
          className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          New division
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-100 bg-surface">
                {["Division", "Category", "Order", "Status", ""].map((h, i) => (
                  <th
                    key={h || i}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {divisions.map((division) => (
                <DivisionRow
                  key={division.id}
                  division={division}
                  canManage={user ? canPublish(user.role) : false}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
