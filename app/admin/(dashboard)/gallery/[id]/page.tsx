import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import AlbumImagePicker from "@/components/admin/AlbumImagePicker";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions, toDateInput } from "@/lib/admin/crud";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit album" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "title",
    label: "Album",
    required: true,
    full: true,
    placeholder: "e.g. NCDMB Practical Nigerian Content Forum 2026",
  },
  {
    kind: "text",
    name: "slug",
    label: "URL slug",
    required: true,
    full: true,
    hint: "Not linked on its own page yet, but it keeps albums distinguishable.",
  },
  {
    kind: "textarea",
    name: "description",
    label: "Description",
    rows: 4,
    maxLength: 600,
    full: true,
  },
  { kind: "date", name: "eventDate", label: "Event date" },
];

const SIDE_FIELDS: Field[] = [
  {
    kind: "number",
    name: "order",
    label: "Order",
    min: 0,
    max: 9999,
    hint: "Lower numbers appear first.",
  },
];

const BLANK: FieldValues = {
  title: "",
  slug: "",
  description: "",
  eventDate: "",
  order: 0,
};

export default async function EditAlbumPage({
  params,
}: PageProps<"/admin/gallery/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.galleryAlbum.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            eventDate: true,
            order: true,
            images: { orderBy: { order: "asc" }, select: { mediaId: true } },
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        title: row.title,
        slug: row.slug,
        description: row.description ?? "",
        eventDate: toDateInput(row.eventDate),
        order: row.order,
      }
    : BLANK;

  const imageIds = row?.images.map((i: { mediaId: string }) => i.mediaId) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New album" : String(values.title)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        slug={{ source: "title", name: "slug" }}
        // Posts with the rest of the form, so the album and its running order
        // are saved in one action rather than two.
        extra={
          <AlbumImagePicker name="imageIds" media={media} defaultValue={imageIds} />
        }
        cancelHref="/admin/gallery"
      />
    </div>
  );
}
