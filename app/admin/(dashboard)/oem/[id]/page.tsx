import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions, toDateInput } from "@/lib/admin/crud";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit OEM partner" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "name",
    label: "Manufacturer",
    required: true,
    full: true,
    placeholder: "e.g. Airpack Netherlands BV",
  },
  {
    kind: "textarea",
    name: "description",
    label: "What they manufacture",
    rows: 4,
    maxLength: 800,
    full: true,
    placeholder: "e.g. Air and gas compressor packages, dryers and nitrogen generators.",
  },
  {
    kind: "text",
    name: "country",
    label: "Based in",
    placeholder: "e.g. Netherlands",
    hint: "Shown under the manufacturer name on the public page.",
  },
  { kind: "url", name: "website", label: "Website", placeholder: "https://…" },
  {
    kind: "text",
    name: "authorisationRef",
    label: "Authorisation reference",
    mono: true,
    hint: "Shown on the public page — leave blank if there is no certificate number.",
  },
  { kind: "date", name: "authorisedFrom", label: "Authorised from" },
  {
    kind: "date",
    name: "authorisedUntil",
    label: "Authorised until",
    hint: "The public page shows this as the validity date.",
  },
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
  name: "",
  description: "",
  country: "",
  website: "",
  authorisationRef: "",
  authorisedFrom: "",
  authorisedUntil: "",
  logoId: "",
  order: 0,
};

export default async function EditOemPartnerPage({
  params,
}: PageProps<"/admin/oem/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.oemPartner.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            description: true,
            country: true,
            website: true,
            authorisationRef: true,
            authorisedFrom: true,
            authorisedUntil: true,
            logoId: true,
            order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        name: row.name,
        description: row.description ?? "",
        country: row.country ?? "",
        website: row.website ?? "",
        authorisationRef: row.authorisationRef ?? "",
        authorisedFrom: toDateInput(row.authorisedFrom),
        authorisedUntil: toDateInput(row.authorisedUntil),
        logoId: row.logoId ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New OEM partner" : String(values.name)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "logoId", label: "Logo", options: media }}
        cancelHref="/admin/oem"
      />
    </div>
  );
}
