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
  name: z.string().trim().min(2, "Name is required."),
  sector: z.string().trim().max(120).optional().or(z.literal("")),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  logoId: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    name: v.name,
    sector: v.sector || null,
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
    entityType: "Client",
    tag: tags.clients(),
    summary: (v) => v.name,
    create: (v) => db.client.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.client.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/about/clients");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "Client",
    tag: tags.clients(),
    publish,
    update: async (rowId, published) => {
      const row = await db.client.update({
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
    entityType: "Client",
    tag: tags.clients(),
    find: async (rowId) => {
      const row = await db.client.findUnique({
        where: { id: rowId },
        select: { name: true },
      });
      return row ? { summary: row.name } : null;
    },
    remove: (rowId) => db.client.delete({ where: { id: rowId } }),
  });
}
