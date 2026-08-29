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
  role: z.string().trim().min(2, "Role is required."),
  bio: z.string().trim().max(1200).optional().or(z.literal("")),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address."),
  photoId: z.string().trim().optional().or(z.literal("")),
  isBoard: z.coerce.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    name: v.name,
    // Blank means "derive it": the slug is required by the schema but is not
    // something an editor should have to think about.
    slug: slugify(v.slug || v.name),
    role: v.role,
    bio: v.bio || null,
    linkedin: v.linkedin || null,
    email: v.email || null,
    photoId: v.photoId || null,
    isBoard: Boolean(v.isBoard),
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
    entityType: "TeamMember",
    tag: tags.team(),
    uniqueField: "slug",
    summary: (v) => v.name,
    create: (v) => db.teamMember.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.teamMember.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/team");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "TeamMember",
    tag: tags.team(),
    publish,
    update: async (rowId, published) => {
      const row = await db.teamMember.update({
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
    entityType: "TeamMember",
    tag: tags.team(),
    find: async (rowId) => {
      const row = await db.teamMember.findUnique({
        where: { id: rowId },
        select: { name: true },
      });
      return row ? { summary: row.name } : null;
    },
    remove: (rowId) => db.teamMember.delete({ where: { id: rowId } }),
  });
}
