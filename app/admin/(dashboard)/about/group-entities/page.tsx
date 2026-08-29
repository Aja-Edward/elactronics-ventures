import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Group entities" };

type Row = {
  id: string;
  name: string;
  website: string | null;
  status: string;
  order: number;
};

export default async function GroupEntitiesAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.groupEntity.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, website: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Entity",
      cell: (row) => (
        <Link
          href={`/admin/about/group-entities/${row.id}`}
          className="font-medium text-brand-900 hover:text-accent-600"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: "Website",
      cell: (row) => row.website ?? <span className="text-steel-500">—</span>,
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/group-entities/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.name}"?`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Group entities"
      newHref="/admin/about/group-entities/new"
      newLabel="New entity"
      empty="No group companies yet. These appear on the Group Entities page."
      columns={columns}
      rows={rows}
    />
  );
}
