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
  title: z.string().trim().min(2, "Title is required."),
  awardedBy: z.string().trim().max(160).optional().or(z.literal("")),
  year: z
    .union([z.literal(""), z.coerce.number().int().min(1900).max(2100)])
    .optional(),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  imageId: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    title: v.title,
    awardedBy: v.awardedBy || null,
    // The year is optional, so an empty field has to become null rather than 0.
    year: typeof v.year === "number" ? v.year : null,
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
    entityType: "Award",
    tag: tags.awards(),
    summary: (v) => v.title,
    create: (v) => db.award.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.award.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/awards");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "Award",
    tag: tags.awards(),
    publish,
    update: async (rowId, published) => {
      const row = await db.award.update({
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
    entityType: "Award",
    tag: tags.awards(),
    find: async (rowId) => {
      const row = await db.award.findUnique({
        where: { id: rowId },
        select: { title: true },
      });
      return row ? { summary: row.title } : null;
    },
    remove: (rowId) => db.award.delete({ where: { id: rowId } }),
  });
}
