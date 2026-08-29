"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  publishResource,
  removeResource,
  saveResource,
  type SaveState,
} from "@/lib/admin/crud";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const Schema = z.object({
  question: z.string().trim().min(5, "Question is required."),
  answer: z.string().trim().min(5, "Answer is required."),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    question: v.question,
    answer: v.answer,
    category: v.category || null,
    order: v.order,
  };
}

export async function save(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const result = await saveResource({
    id,
    formData,
    schema: Schema,
    entityType: "Faq",
    tag: tags.faqs(),
    summary: (v) => v.question,
    create: (v) => db.faq.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.faq.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/faqs");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "Faq",
    tag: tags.faqs(),
    publish,
    update: async (rowId, published) => {
      const row = await db.faq.update({
        where: { id: rowId },
        data: { status: published ? "PUBLISHED" : "DRAFT" },
        select: { question: true },
      });
      return { summary: row.question };
    },
  });
}

export async function remove(id: string): Promise<SaveState> {
  return removeResource({
    id,
    entityType: "Faq",
    tag: tags.faqs(),
    find: async (rowId) => {
      const row = await db.faq.findUnique({
        where: { id: rowId },
        select: { question: true },
      });
      return row ? { summary: row.question } : null;
    },
    remove: (rowId) => db.faq.delete({ where: { id: rowId } }),
  });
}
