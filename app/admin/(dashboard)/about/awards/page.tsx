import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Awards & recognition" };

type Row = {
  id: string;
  title: string;
  awardedBy: string | null;
  year: number | null;
  status: string;
  order: number;
};

export default async function AwardsAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.award.findMany({
    orderBy: [{ year: "desc" }, { order: "asc" }],
    select: { id: true, title: true, awardedBy: true, year: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Award",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/about/awards/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.title}
          </Link>
          <p className="mt-0.5 text-[11px] text-steel-500">{row.awardedBy ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Year",
      cell: (row) => <span className="tabular-nums">{row.year ?? "—"}</span>,
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/awards/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.title}"?`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Awards & recognition"
      newHref="/admin/about/awards/new"
      newLabel="New award"
      empty="No awards yet. Published awards are listed newest first."
      columns={columns}
      rows={rows}
    />
  );
}
