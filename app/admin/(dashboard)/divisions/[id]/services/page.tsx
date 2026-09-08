import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Division sub-pages" };

type Row = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  heroImageId: string | null;
  status: string;
  order: number;
};

export default async function DivisionServicesPage({
  params,
}: PageProps<"/admin/divisions/[id]/services">) {
  const { id } = await params;

  const [user, division] = await Promise.all([
    getCurrentUser(),
    db.division.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    }),
  ]);

  if (!division) notFound();

  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.service.findMany({
    where: { divisionId: division.id },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      body: true,
      heroImageId: true,
      status: true,
      order: true,
    },
  });

  const columns: Column<Row>[] = [
    {
      header: "Sub-page",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/divisions/${division.id}/services/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.title}
          </Link>
          <p className="mt-0.5 font-mono text-[11px] text-steel-500">
            /divisions/{division.slug}/{row.slug}
          </p>
        </div>
      ),
    },
    {
      // The two things that make a sub-page look finished on the public site.
      // Both are easy to skip while adding records in bulk, and neither is
      // visible from the list without saying so.
      header: "Image",
      cell: (row) =>
        row.heroImageId ? (
          <span className="text-xs text-steel-600">Set</span>
        ) : (
          <span className="text-xs font-medium text-accent-700">
            Using division&rsquo;s
          </span>
        ),
    },
    {
      header: "Detail page",
      cell: (row) =>
        row.body ? (
          <span className="text-xs text-steel-600">Written</span>
        ) : (
          <span className="text-xs font-medium text-accent-700">No body yet</span>
        ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    {
      header: "Status",
      cell: (row) => <StatusPill published={row.status === "PUBLISHED"} />,
    },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/divisions/${division.id}/services/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, division.id, row.id)}
          onDelete={remove.bind(null, division.id, row.id)}
          confirmMessage={`Delete "${row.title}"? Its URL will start redirecting only if you rename it instead.`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-xs text-steel-600">
        <Link href="/admin/divisions" className="hover:text-brand-900">
          Divisions
        </Link>
        <span className="mx-2 text-steel-400">/</span>
        <Link
          href={`/admin/divisions/${division.id}`}
          className="hover:text-brand-900"
        >
          {division.title}
        </Link>
        <span className="mx-2 text-steel-400">/</span>
        <span className="text-brand-900">Sub-pages</span>
      </nav>

      <ResourceList
        title={`${division.title} sub-pages`}
        newHref={`/admin/divisions/${division.id}/services/new`}
        newLabel="New sub-page"
        empty={`No sub-pages under ${division.title} yet. Each one becomes a page beneath the division, with its own image, description and web address.`}
        columns={columns}
        rows={rows}
      />
    </div>
  );
}
