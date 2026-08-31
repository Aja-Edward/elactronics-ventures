import type { Metadata } from "next";
import Link from "next/link";

import { remove, setPublished } from "./actions";
import ResourceList, { type Column } from "@/components/admin/ResourceList";
import RowActions, { StatusPill } from "@/components/admin/RowActions";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Events gallery" };

type Row = {
  id: string;
  title: string;
  slug: string;
  eventDate: Date | null;
  status: string;
  order: number;
  _count: { images: number };
};

export default async function GalleryAdminPage() {
  const user = await getCurrentUser();
  const canManage = user ? canPublish(user.role) : false;

  const rows: Row[] = await db.galleryAlbum.findMany({
    orderBy: [{ order: "asc" }, { eventDate: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      eventDate: true,
      status: true,
      order: true,
      _count: { select: { images: true } },
    },
  });

  const columns: Column<Row>[] = [
    {
      header: "Album",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/gallery/${row.id}`}
            className="font-medium text-brand-900 hover:text-accent-600"
          >
            {row.title}
          </Link>
          <p className="mt-0.5 text-[11px] text-steel-500">
            {row.eventDate
              ? row.eventDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No date"}
          </p>
        </div>
      ),
    },
    {
      header: "Images",
      // The public page skips albums with no images altogether, so an empty
      // one is invisible however it is published. Worth saying here.
      cell: (row) =>
        row._count.images === 0 ? (
          <span className="text-xs font-medium text-accent-700">
            Empty — will not show
          </span>
        ) : (
          <span className="tabular-nums text-xs text-steel-600">{row._count.images}</span>
        ),
    },
    { header: "Order", cell: (row) => <span className="tabular-nums">{row.order}</span> },
    { header: "Status", cell: (row) => <StatusPill published={row.status === "PUBLISHED"} /> },
    {
      header: "",
      right: true,
      cell: (row) => (
        <RowActions
          editHref={`/admin/gallery/${row.id}`}
          published={row.status === "PUBLISHED"}
          canManage={canManage}
          onTogglePublish={setPublished.bind(null, row.id)}
          onDelete={remove.bind(null, row.id)}
          confirmMessage={`Delete "${row.title}"? The photographs stay in the media library.`}
        />
      ),
    },
  ];

  return (
    <ResourceList
      title="Events gallery"
      newHref="/admin/gallery/new"
      newLabel="New album"
      empty="No albums yet. Upload photographs to the media library, then group them into an album here."
      columns={columns}
      rows={rows}
    />
  );
}
