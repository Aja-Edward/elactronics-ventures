import type { Metadata } from "next";
import Link from "next/link";

import ProjectTable, { type ProjectSummary } from "./ProjectTable";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.project.findMany({
    orderBy: [{ isFeatured: "desc" }, { year: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      clientName: true,
      year: true,
      isFeatured: true,
      status: true,
      heroImage: { select: { secureUrl: true } },
      division: { select: { title: true } },
    },
  });

  const items: ProjectSummary[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    clientName: r.clientName,
    year: r.year,
    divisionTitle: r.division?.title ?? null,
    isFeatured: r.isFeatured,
    published: r.status === "PUBLISHED",
    imageUrl: r.heroImage?.secureUrl ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            Projects
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            {items.filter((i) => i.published).length} of {items.length} published.
            This is a past-performance record — every entry claims the company
            delivered that scope.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          New project
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">No projects yet.</p>
        </div>
      ) : (
        <ProjectTable items={items} canManage={user ? canPublish(user.role) : false} />
      )}
    </div>
  );
}
