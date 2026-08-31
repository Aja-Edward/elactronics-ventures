import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "OEM partners" };

type Row = {
  id: string;
  name: string;
  authorisationRef: string | null;
  authorisedUntil: Date | null;
  status: string;
  order: number;
  logoId: string | null;
};

export default async function OemAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.oemPartner.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      authorisationRef: true,
      authorisedUntil: true,
      status: true,
      order: true,
      logoId: true,
    },
  });

  // Compared against today's date, resolved once for the whole table so every
  // row is judged against the same instant.
  const today = new Date();

  const columns: Column<Row>[] = [
    {
      header: "Manufacturer",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/oem/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.name}
          </Link>
          <p className="mt-0.5 font-mono text-[11px] text-steel-500">
            {row.authorisationRef ?? "no reference"}
          </p>
        </div>
      ),
    },
    {
      header: "Authorisation",
      // The whole point of this page is that the authorisations are current.
      // An expired one still showing on the public site misstates the
      // relationship, so it is called out here rather than only on the form.
      cell: (row) => {
        if (!row.authorisedUntil) {
          return <span className="text-xs text-steel-500">No expiry set</span>;
        }
        const expired = row.authorisedUntil < today;
        return (
          <span className={expired ? "text-xs font-semibold text-accent-700" : "text-xs text-steel-600"}>
            {expired ? "Expired " : "Valid to "}
            {row.authorisedUntil.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      header: "Logo",
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
          editHref={`/admin/oem/${row.id}`}
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
      title="OEM partners"
      newHref="/admin/oem/new"
      newLabel="New partner"
      empty="No OEM authorisations yet. Add one, then attach its logo from the media library."
      columns={columns}
      rows={rows}
    />
  );
}
