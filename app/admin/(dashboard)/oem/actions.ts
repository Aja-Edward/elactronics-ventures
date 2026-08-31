"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  publishResource,
  removeResource,
  saveResource,
  toDate,
  type SaveState,
} from "@/lib/admin/crud";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const Schema = z
  .object({
    name: z.string().trim().min(2, "Name is required."),
    description: z.string().trim().max(800).optional().or(z.literal("")),
    country: z.string().trim().max(80).optional().or(z.literal("")),
    website: z.string().trim().max(300).optional().or(z.literal("")),
    authorisationRef: z.string().trim().max(120).optional().or(z.literal("")),
    authorisedFrom: z.string().trim().optional().or(z.literal("")),
    authorisedUntil: z.string().trim().optional().or(z.literal("")),
    logoId: z.string().trim().optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).max(9999),
  })
  // An authorisation that lapsed before it started is a data-entry slip, and
  // the public page states these dates as fact — so it is caught here rather
  // than published.
  .refine(
    (v) => {
      const from = toDate(v.authorisedFrom);
      const until = toDate(v.authorisedUntil);
      return !from || !until || until >= from;
    },
    { message: "Must be on or after the start date.", path: ["authorisedUntil"] },
  );

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    name: v.name,
    description: v.description || null,
    country: v.country || null,
    website: v.website || null,
    authorisationRef: v.authorisationRef || null,
    authorisedFrom: toDate(v.authorisedFrom),
    authorisedUntil: toDate(v.authorisedUntil),
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
    entityType: "OemPartner",
    tag: tags.oemPartners(),
    summary: (v) => v.name,
    create: (v) => db.oemPartner.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.oemPartner.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;
  redirect("/admin/oem");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "OemPartner",
    tag: tags.oemPartners(),
    publish,
    update: async (rowId, published) => {
      const row = await db.oemPartner.update({
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
    entityType: "OemPartner",
    tag: tags.oemPartners(),
    find: async (rowId) => {
      const row = await db.oemPartner.findUnique({
        where: { id: rowId },
        select: { name: true },
      });
      return row ? { summary: row.name } : null;
    },
    remove: (rowId) => db.oemPartner.delete({ where: { id: rowId } }),
  });
}
