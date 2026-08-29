import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "FAQs" };

type Row = {
  id: string;
  question: string;
  category: string | null;
  status: string;
  order: number;
};

export default async function FaqsAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.faq.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: { id: true, question: true, category: true, status: true, order: true },
  });

  const columns: Column<Row>[] = [
    {
      header: "Question",
      cell: (row) => (
        <Link
          href={`/admin/about/faqs/${row.id}`}
          className="font-medium text-brand-900 hover:text-accent-600"
        >
          {row.question}
        </Link>
      ),
    },
    {
      header: "Category",
      cell: (row) => row.category ?? <span className="text-steel-500">General</span>,
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/about/faqs/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.question}"?`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="FAQs"
      newHref="/admin/about/faqs/new"
      newLabel="New question"
      empty="No questions yet. Give each one a category to group them on the public page."
      columns={columns}
      rows={rows}
    />
  );
}
