import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions } from "@/lib/admin/crud";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit milestone" };

const FIELDS: Field[] = [
  { kind: "number", name: "year", label: "Year", required: true, min: 1900, max: 2100 },
  {
    kind: "text",
    name: "title",
    label: "Milestone",
    required: true,
    placeholder: "e.g. Incorporated in Lagos",
  },
  {
    kind: "textarea",
    name: "description",
    label: "Detail",
    rows: 5,
    maxLength: 800,
    full: true,
    placeholder: "What happened, and why it mattered.",
  },
];

const SIDE_FIELDS: Field[] = [
  {
    kind: "number",
    name: "order",
    label: "Order",
    min: 0,
    max: 9999,
    hint: "Only used to break ties within the same year.",
  },
];

const BLANK: FieldValues = {
  year: new Date().getFullYear(),
  title: "",
  description: "",
  imageId: "",
  order: 0,
};

export default async function EditMilestonePage({
  params,
}: PageProps<"/admin/about/history/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.historyMilestone.findUnique({
          where: { id },
          select: {
            id: true, year: true, title: true, description: true,
            imageId: true, order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        year: row.year,
        title: row.title,
        description: row.description ?? "",
        imageId: row.imageId ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New milestone" : `${values.year} — ${values.title}`}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "imageId", label: "Image", options: media }}
        cancelHref="/admin/about/history"
      />
    </div>
  );
}
