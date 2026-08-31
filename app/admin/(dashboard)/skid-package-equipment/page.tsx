import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SKID_GROUP } from "@/lib/service-groups";

export const instant = false;

export const metadata: Metadata = { title: "Skid package systems" };

type Row = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  status: string;
  order: number;
};

export default async function SkidAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.service.findMany({
    where: { group: SKID_GROUP },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, title: true, slug: true, body: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "System",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/skid-package-equipment/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.title}
          </Link>
          <p className="mt-0.5 font-mono text-[11px] text-steel-500">/{row.slug}</p>
        </div>
      ),
    },
    {
      header: "Detail page",
      // These four were seeded with a summary but no body, so every detail page
      // currently reads "Detailed description coming soon." Flagging it here is
      // the only place an editor would notice without opening each one.
      cell: (row) =>
        row.body ? (
          <span className="text-xs text-steel-600">Written</span>
        ) : (
          <span className="text-xs font-medium text-accent-700">No body yet</span>
        ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/skid-package-equipment/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.title}"? Its URL will start redirecting only if you rename it instead.`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Skid package systems"
      newHref="/admin/skid-package-equipment/new"
      newLabel="New system"
      empty="No skid-package systems yet. Each one becomes a page under Skid Package Equipment."
      columns={columns}
      rows={rows}
    />
  );
}
