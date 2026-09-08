import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions } from "@/lib/admin/crud";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit division sub-page" };

const SIDE_FIELDS: Field[] = [
  {
    kind: "number",
    name: "order",
    label: "Order",
    min: 0,
    max: 9999,
    hint: "Lower numbers appear first.",
  },
  { kind: "text", name: "seoTitle", label: "SEO title", hint: "Defaults to the title." },
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

export default async function EditDivisionServicePage({
  params,
}: PageProps<"/admin/divisions/[id]/services/[serviceId]">) {
  const { id, serviceId } = await params;
  const creating = serviceId === "new";

  const [division, row, media] = await Promise.all([
    db.division.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    }),
    creating
      ? null
      : // Scoped to the division as well as the id, so another division's
        // sub-page cannot be opened — let alone re-saved — through this screen.
        db.service.findFirst({
          where: { id: serviceId, divisionId: id },
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

  if (!division) notFound();
  if (!creating && !row) notFound();

  // Built here rather than at module scope so the hint can name the division's
  // own URL — the one thing an editor most wants confirmed before saving.
  const fields: Field[] = [
    {
      kind: "text",
      name: "title",
      label: "Title",
      required: true,
      full: true,
      placeholder: "e.g. Trelleborg Oil & Marine Hose",
    },
    {
      kind: "text",
      name: "slug",
      label: "URL slug",
      required: true,
      full: true,
      hint: `The page lives at /divisions/${division.slug}/<slug>. Renaming it leaves a redirect behind.`,
    },
    {
      kind: "textarea",
      name: "summary",
      label: "Summary",
      rows: 3,
      maxLength: 400,
      full: true,
      hint: "The blurb on the division's card grid, and the line under the heading on this page.",
    },
    {
      kind: "textarea",
      name: "body",
      label: "Body",
      rows: 14,
      full: true,
      hint: "Plain text. Leave a blank line between paragraphs. List products and applications here.",
    },
  ];

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
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="text-xs text-steel-600">
          <Link href="/admin/divisions" className="hover:text-brand-900">
            Divisions
          </Link>
          <span className="mx-2 text-steel-400">/</span>
          <Link
            href={`/admin/divisions/${division.id}/services`}
            className="hover:text-brand-900"
          >
            {division.title}
          </Link>
          <span className="mx-2 text-steel-400">/</span>
          <span className="text-brand-900">
            {creating ? "New sub-page" : String(values.title)}
          </span>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          {creating ? `New ${division.title} sub-page` : String(values.title)}
        </h1>
      </div>

      <ResourceForm
        action={save.bind(null, division.id, row?.id ?? null)}
        values={values}
        fields={fields}
        sideFields={SIDE_FIELDS}
        media={{
          name: "heroImageId",
          label: "Image",
          options: media,
        }}
        slug={{ source: "title", name: "slug" }}
        cancelHref={`/admin/divisions/${division.id}/services`}
      />
    </div>
  );
}
