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

export const metadata: Metadata = { title: "Edit client" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "name",
    label: "Client",
    required: true,
    placeholder: "e.g. Shell Nigeria Exploration",
  },
  {
    kind: "text",
    name: "sector",
    label: "Sector",
    placeholder: "e.g. Upstream oil & gas",
  },
  { kind: "url", name: "website", label: "Website", full: true, placeholder: "https://…" },
];

const SIDE_FIELDS: Field[] = [
  { kind: "number", name: "order", label: "Order", min: 0, max: 9999, hint: "Lower numbers appear first." },
];

const BLANK: FieldValues = { name: "", sector: "", website: "", logoId: "", order: 0 };

export default async function EditClientPage({
  params,
}: PageProps<"/admin/about/clients/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.client.findUnique({
          where: { id },
          select: { id: true, name: true, sector: true, website: true, logoId: true, order: true },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        name: row.name,
        sector: row.sector ?? "",
        website: row.website ?? "",
        logoId: row.logoId ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New client" : String(values.name)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "logoId", label: "Logo", options: media }}
        cancelHref="/admin/about/clients"
      />
    </div>
  );
}
