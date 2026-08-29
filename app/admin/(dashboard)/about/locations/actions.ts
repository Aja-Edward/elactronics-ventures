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
  country: z.string().trim().min(2, "Country is required."),
  addressLine: z.string().trim().max(240).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(60).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address."),
  mapEmbedUrl: z.string().trim().max(600).optional().or(z.literal("")),
  imageId: z.string().trim().optional().or(z.literal("")),
  isHeadOffice: z.coerce.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    name: v.name,
    slug: slugify(v.slug || v.name),
    country: v.country,
    addressLine: v.addressLine || null,
    city: v.city || null,
    state: v.state || null,
    phone: v.phone || null,
    email: v.email || null,
    mapEmbedUrl: v.mapEmbedUrl || null,
    imageId: v.imageId || null,
    isHeadOffice: Boolean(v.isHeadOffice),
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
    entityType: "Location",
    tag: tags.locations(),
    uniqueField: "slug",
    summary: (v) => v.name,
    create: (v) => db.location.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.location.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/locations");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "Location",
    tag: tags.locations(),
    publish,
    update: async (rowId, published) => {
      const row = await db.location.update({
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
    entityType: "Location",
    tag: tags.locations(),
    find: async (rowId) => {
      const row = await db.location.findUnique({
        where: { id: rowId },
        select: { name: true },
      });
      return row ? { summary: row.name } : null;
    },
    remove: (rowId) => db.location.delete({ where: { id: rowId } }),
  });
}
