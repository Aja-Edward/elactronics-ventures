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

export const metadata: Metadata = { title: "Edit award" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "title",
    label: "Award",
    required: true,
    full: true,
    placeholder: "e.g. HSE Contractor of the Year",
  },
  {
    kind: "text",
    name: "awardedBy",
    label: "Awarded by",
    placeholder: "e.g. NCDMB",
  },
  { kind: "number", name: "year", label: "Year", min: 1900, max: 2100 },
  {
    kind: "textarea",
    name: "description",
    label: "Detail",
    rows: 5,
    maxLength: 800,
    full: true,
    placeholder: "What the award recognised.",
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
  title: "", awardedBy: "", year: "", description: "", imageId: "", order: 0,
};

export default async function EditAwardPage({
  params,
}: PageProps<"/admin/about/awards/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.award.findUnique({
          where: { id },
          select: {
            id: true, title: true, awardedBy: true, year: true,
            description: true, imageId: true, order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        title: row.title,
        awardedBy: row.awardedBy ?? "",
        year: row.year ?? "",
        description: row.description ?? "",
        imageId: row.imageId ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New award" : String(values.title)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "imageId", label: "Image", options: media }}
        cancelHref="/admin/about/awards"
      />
    </div>
  );
}
