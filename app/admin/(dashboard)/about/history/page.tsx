import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Company history" };

type Row = {
  id: string;
  year: number;
  title: string;
  status: string;
  order: number;
};

export default async function HistoryAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.historyMilestone.findMany({
    orderBy: [{ year: "asc" }, { order: "asc" }],
    select: { id: true, year: true, title: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Year",
      cell: (row) => (
        <span className="font-display font-bold text-brand-900 tabular-nums">
          {row.year}
        </span>
      ),
    },
    {
      header: "Milestone",
      cell: (row) => (
        <Link
          href={`/admin/about/history/${row.id}`}
          className="font-medium text-brand-900 hover:text-accent-600"
        >
          {row.title}
        </Link>
      ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/history/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete the ${row.year} milestone "${row.title}"?`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Company history"
      newHref="/admin/about/history/new"
      newLabel="New milestone"
      empty="No milestones yet. These build the timeline on the Our History page, oldest first."
      columns={columns}
      rows={rows}
    />
  );
}
