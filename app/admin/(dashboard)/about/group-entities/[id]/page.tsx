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

export const metadata: Metadata = { title: "Edit group entity" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "name",
    label: "Entity",
    required: true,
    placeholder: "e.g. Elatronics Marine Ltd",
  },
  {
    kind: "text",
    name: "slug",
    label: "Web address",
    hint: "Filled in from the name.",
  },
  { kind: "url", name: "website", label: "Website", full: true, placeholder: "https://…" },
  {
    kind: "textarea",
    name: "description",
    label: "What it does",
    rows: 5,
    maxLength: 800,
    full: true,
  },
];

const SIDE_FIELDS: Field[] = [
  { kind: "number", name: "order", label: "Order", min: 0, max: 9999, hint: "Lower numbers appear first." },
];

const BLANK: FieldValues = {
  name: "", slug: "", website: "", description: "", logoId: "", order: 0,
};

export default async function EditGroupEntityPage({
  params,
}: PageProps<"/admin/about/group-entities/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.groupEntity.findUnique({
          where: { id },
          select: {
            id: true, name: true, slug: true, website: true,
            description: true, logoId: true, order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        name: row.name,
        slug: row.slug,
        website: row.website ?? "",
        description: row.description ?? "",
        logoId: row.logoId ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New group entity" : String(values.name)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "logoId", label: "Logo", options: media }}
        slug={{ source: "name", name: "slug" }}
        cancelHref="/admin/about/group-entities"
      />
    </div>
  );
}
