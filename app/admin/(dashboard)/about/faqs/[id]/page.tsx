import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit question" };

const FIELDS: Field[] = [
  {
    kind: "text",
    name: "question",
    label: "Question",
    required: true,
    full: true,
    placeholder: "e.g. How quickly can you mobilise to site?",
  },
  {
    kind: "textarea",
    name: "answer",
    label: "Answer",
    required: true,
    rows: 8,
    full: true,
  },
  {
    kind: "text",
    name: "category",
    label: "Category",
    full: true,
    hint: "Questions sharing a category are grouped under it. Leave blank for General.",
    placeholder: "e.g. Working with us",
  },
];

const SIDE_FIELDS: Field[] = [
  {
    kind: "number",
    name: "order",
    label: "Order",
    min: 0,
    max: 9999,
    hint: "Position within the category.",
  },
];

const BLANK: FieldValues = { question: "", answer: "", category: "", order: 0 };

export default async function EditFaqPage({
  params,
}: PageProps<"/admin/about/faqs/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const row = creating
    ? null
    : await db.faq.findUnique({
        where: { id },
        select: { id: true, question: true, answer: true, category: true, order: true },
      });

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        question: row.question,
        answer: row.answer,
        category: row.category ?? "",
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New question" : String(values.question)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        cancelHref="/admin/about/faqs"
      />
    </div>
  );
}
