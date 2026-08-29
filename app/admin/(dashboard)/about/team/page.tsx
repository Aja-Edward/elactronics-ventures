import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Board & leadership" };

type Row = {
  id: string;
  name: string;
  role: string;
  isBoard: boolean;
  status: string;
  order: number;
};

export default async function TeamAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.teamMember.findMany({
    orderBy: [{ isBoard: "desc" }, { order: "asc" }],
    select: { id: true, name: true, role: true, isBoard: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Name",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/about/team/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.name}
          </Link>
          <p className="mt-0.5 text-[11px] text-steel-500">{row.role}</p>
        </div>
      ),
    },
    {
      header: "Listing",
      cell: (row) => (row.isBoard ? "Board" : "Leadership"),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/team/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.name}"? Any photo stays in the media library.`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Board & leadership"
      newHref="/admin/about/team/new"
      newLabel="New person"
      empty="No one added yet. Board members and the leadership team both appear on the Governance page."
      columns={columns}
      rows={rows}
    />
  );
}
