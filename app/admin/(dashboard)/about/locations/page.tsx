import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Locations" };

type Row = {
  id: string;
  name: string;
  city: string | null;
  country: string;
  isHeadOffice: boolean;
  status: string;
  order: number;
};

export default async function LocationsAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.location.findMany({
    orderBy: [{ isHeadOffice: "desc" }, { order: "asc" }],
    select: {
      id: true, name: true, city: true, country: true,
      isHeadOffice: true, status: true, order: true,
    },
  });

  const columns: Column<Row>[] = [
    {
      header: "Location",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/about/locations/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.name}
          </Link>
          {row.isHeadOffice && (
            <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
              Head office
            </span>
          )}
          <p className="mt-0.5 text-[11px] text-steel-500">
            {[row.city, row.country].filter(Boolean).join(", ")}
          </p>
        </div>
      ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/locations/${row.id}`}
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
      title="Locations"
      newHref="/admin/about/locations/new"
      newLabel="New location"
      empty="No locations yet. The head office is listed first on the Global Locations page."
      columns={columns}
      rows={rows}
    />
  );
}
