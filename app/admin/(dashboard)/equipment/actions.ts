"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EquipmentSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(1500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  quantity: z.string().trim().optional().or(z.literal("")),
  imageId: z.string().trim().optional().or(z.literal("")),
  specs: z.string().optional(),
  order: z.coerce.number().int().min(0).max(9999),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

/**
 * Specs arrive as "Label: value" lines. Simple enough for an operations person
 * to type, structured enough to render as a table and query later.
 */
function parseSpecLines(raw: string | undefined) {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return [{ label: line, value: "" }];
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return label ? [{ label, value }] : [];
    });
}

export async function saveEquipment(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = EquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  // Quantity is optional, but if given it must be a positive whole number —
  // "we own 2.5 compressors" is a typo, not a fact.
  let quantity: number | null = null;
  if (input.quantity) {
    const n = Number(input.quantity);
    if (!Number.isInteger(n) || n < 1) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: { quantity: "Whole number of units, or leave blank." },
      };
    }
    quantity = n;
  }

  const clash = await db.equipment.findFirst({
    where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Another item already uses this slug." },
    };
  }

  const data = {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    category: input.category || null,
    quantity,
    imageId: input.imageId || null,
    specs: parseSpecLines(input.specs),
    order: input.order,
  };

  if (id) {
    await db.equipment.update({ where: { id }, data });
  } else {
    const created = await db.equipment.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "update",
      entityType: "Equipment",
      entityId: id!,
      summary: input.name,
    },
  });

  updateTag(tags.equipment());
  redirect("/admin/equipment");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const item = await db.equipment.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
    },
    select: { name: true },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: publish ? "publish" : "unpublish",
      entityType: "Equipment",
      entityId: id,
      summary: item.name,
    },
  });

  updateTag(tags.equipment());
  return {};
}

export async function deleteEquipment(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const item = await db.equipment.findUnique({ where: { id }, select: { name: true } });
  if (!item) return { error: "That item no longer exists." };

  await db.equipment.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "Equipment",
      entityId: id,
      summary: item.name,
    },
  });

  updateTag(tags.equipment());
  return {};
}
