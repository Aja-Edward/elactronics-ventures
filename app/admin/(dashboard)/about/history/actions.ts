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
  year: z.coerce
    .number()
    .int()
    .min(1900, "Use a four-digit year.")
    .max(2100, "Use a four-digit year."),
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  imageId: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    year: v.year,
    title: v.title,
    description: v.description || null,
    imageId: v.imageId || null,
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
    entityType: "HistoryMilestone",
    tag: tags.history(),
    summary: (v) => `${v.year} — ${v.title}`,
    create: (v) => db.historyMilestone.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) =>
      db.historyMilestone.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/history");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "HistoryMilestone",
    tag: tags.history(),
    publish,
    update: async (rowId, published) => {
      const row = await db.historyMilestone.update({
        where: { id: rowId },
        data: { status: published ? "PUBLISHED" : "DRAFT" },
        select: { title: true },
      });
      return { summary: row.title };
    },
  });
}

export async function remove(id: string): Promise<SaveState> {
  return removeResource({
    id,
    entityType: "HistoryMilestone",
    tag: tags.history(),
    find: async (rowId) => {
      const row = await db.historyMilestone.findUnique({
        where: { id: rowId },
        select: { title: true },
      });
      return row ? { summary: row.title } : null;
    },
    remove: (rowId) => db.historyMilestone.delete({ where: { id: rowId } }),
  });
}
