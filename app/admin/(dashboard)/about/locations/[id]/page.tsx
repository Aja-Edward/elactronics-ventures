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

export const metadata: Metadata = { title: "Edit location" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "name",
    label: "Location",
    required: true,
    placeholder: "e.g. Lagos Head Office",
  },
  { kind: "text", name: "slug", label: "Web address", hint: "Filled in from the name." },
  {
    kind: "text",
    name: "addressLine",
    label: "Street address",
    full: true,
    placeholder: "e.g. Royal Garden Estate, Off Lakowe Lake Resort Road",
  },
  { kind: "text", name: "city", label: "City" },
  { kind: "text", name: "state", label: "State" },
  { kind: "text", name: "country", label: "Country", required: true },
  { kind: "text", name: "phone", label: "Phone" },
  { kind: "email", name: "email", label: "Email", full: true },
  {
    kind: "url",
    name: "mapEmbedUrl",
    label: "Map embed URL",
    full: true,
    hint: "Optional. The src from a Google Maps embed.",
  },
];

const SIDE_FIELDS: Field[] = [
  {
    kind: "checkbox",
    name: "isHeadOffice",
    label: "Head office",
    hint: "Head offices are listed first and badged on the public page.",
  },
  { kind: "number", name: "order", label: "Order", min: 0, max: 9999, hint: "Lower numbers appear first." },
];

const BLANK: FieldValues = {
  name: "", slug: "", addressLine: "", city: "", state: "", country: "Nigeria",
  phone: "", email: "", mapEmbedUrl: "", imageId: "", isHeadOffice: false, order: 0,
};

export default async function EditLocationPage({
  params,
}: PageProps<"/admin/about/locations/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.location.findUnique({
          where: { id },
          select: {
            id: true, name: true, slug: true, addressLine: true, city: true,
            state: true, country: true, phone: true, email: true,
            mapEmbedUrl: true, imageId: true, isHeadOffice: true, order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        name: row.name,
        slug: row.slug,
        addressLine: row.addressLine ?? "",
        city: row.city ?? "",
        state: row.state ?? "",
        country: row.country,
        phone: row.phone ?? "",
        email: row.email ?? "",
        mapEmbedUrl: row.mapEmbedUrl ?? "",
        imageId: row.imageId ?? "",
        isHeadOffice: row.isHeadOffice,
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New location" : String(values.name)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "imageId", label: "Photo", options: media }}
        slug={{ source: "name", name: "slug" }}
        cancelHref="/admin/about/locations"
      />
    </div>
  );
}
