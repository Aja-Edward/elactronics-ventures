import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions } from "@/lib/admin/crud";
import { db } from "@/lib/db";
import { SKID_GROUP } from "@/lib/service-groups";

export const instant = false;

export const metadata: Metadata = { title: "Edit skid package system" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "title",
    label: "System",
    required: true,
    full: true,
    placeholder: "e.g. Midstream Oil & Gas Modular Process Systems",
  },
  {
    kind: "text",
    name: "slug",
    label: "URL slug",
    required: true,
    full: true,
    hint: "The page lives at /skid-package-equipment/<slug>. Renaming it leaves a redirect behind.",
  },
  {
    kind: "textarea",
    name: "summary",
    label: "Summary",
    rows: 3,
    maxLength: 400,
    full: true,
    hint: "Shown on the index card and in the menu tooltip.",
  },
  {
    kind: "textarea",
    name: "body",
    label: "Body",
    rows: 12,
    full: true,
    hint: "Plain text. Leave a blank line between paragraphs.",
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
  { kind: "text", name: "seoTitle", label: "SEO title", hint: "Defaults to the system name." },
  {
    kind: "textarea",
    name: "seoDescription",
    label: "SEO description",
    rows: 3,
    maxLength: 180,
    hint: "Defaults to the summary.",
  },
];

const BLANK: FieldValues = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  heroImageId: "",
  seoTitle: "",
  seoDescription: "",
  order: 0,
};

export default async function EditSkidSystemPage({
  params,
}: PageProps<"/admin/skid-package-equipment/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : // Scoped to the group as well as the id, so a division's service can
        // never be opened — let alone re-saved — through this screen.
        db.service.findFirst({
          where: { id, group: SKID_GROUP },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            body: true,
            heroImageId: true,
            seoTitle: true,
            seoDescription: true,
            order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        title: row.title,
        slug: row.slug,
        summary: row.summary ?? "",
        body: row.body ?? "",
        heroImageId: row.heroImageId ?? "",
        seoTitle: row.seoTitle ?? "",
        seoDescription: row.seoDescription ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New skid package system" : String(values.title)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "heroImageId", label: "Hero image", options: media }}
        slug={{ source: "title", name: "slug" }}
        cancelHref="/admin/skid-package-equipment"
      />
    </div>
  );
}
