import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Clients" };

type Row = {
  id: string;
  name: string;
  sector: string | null;
  status: string;
  order: number;
  logoId: string | null;
};

export default async function ClientsAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.client.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, sector: true, status: true, order: true, logoId: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Client",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/about/clients/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.name}
          </Link>
          <p className="mt-0.5 text-[11px] text-steel-500">{row.sector ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Logo",
      // A client wall without logos is just a list of names, so a missing one
      // is worth flagging in the list rather than only on the form.
      cell: (row) =>
        row.logoId ? (
          <span className="text-xs text-steel-600">Attached</span>
        ) : (
          <span className="text-xs font-medium text-accent-700">Missing</span>
        ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/clients/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.name}"? The logo stays in the media library.`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Clients"
      newHref="/admin/about/clients/new"
      newLabel="New client"
      empty="No clients yet. Add one, then attach its logo from the media library."
      columns={columns}
      rows={rows}
    />
  );
}
