"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  publishResource,
  removeResource,
  saveResource,
  slugify,
  type SaveState,
} from "@/lib/admin/crud";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const Schema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  logoId: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    name: v.name,
    slug: slugify(v.slug || v.name),
    description: v.description || null,
    website: v.website || null,
    logoId: v.logoId || null,
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
    entityType: "GroupEntity",
    tag: tags.groupEntities(),
    uniqueField: "slug",
    summary: (v) => v.name,
    create: (v) => db.groupEntity.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.groupEntity.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/group-entities");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "GroupEntity",
    tag: tags.groupEntities(),
    publish,
    update: async (rowId, published) => {
      const row = await db.groupEntity.update({
        where: { id: rowId },
        data: { status: published ? "PUBLISHED" : "DRAFT" },
        select: { name: true },
      });
      return { summary: row.name };
    },
  });
}

export async function remove(id: string): Promise<SaveState> {
  return removeResource({
    id,
    entityType: "GroupEntity",
    tag: tags.groupEntities(),
    find: async (rowId) => {
      const row = await db.groupEntity.findUnique({
        where: { id: rowId },
        select: { name: true },
      });
      return row ? { summary: row.name } : null;
    },
    remove: (rowId) => db.groupEntity.delete({ where: { id: rowId } }),
  });
}
