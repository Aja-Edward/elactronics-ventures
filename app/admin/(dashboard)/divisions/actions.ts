"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";

/**
 * Division CRUD.
 *
 * `updateTag` rather than `revalidateTag` throughout: an editor who just hit
 * Save expects to open the public page and see their change, not a stale copy
 * being refreshed behind them. updateTag expires the entry immediately, which
 * is the read-your-own-writes behaviour the CMS needs. It is also the reason
 * these must be Server Actions — updateTag is not available elsewhere.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DivisionSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Slug may use lowercase letters, numbers and hyphens only."),
  category: z.enum(["EPCIM", "SERVICE_OFFERING", "PROCUREMENT"]),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().trim().optional().or(z.literal("")),
  capabilities: z.string().optional(),
  heroImageId: z.string().trim().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

/** Invalidates the list and, if the slug is known, that division's own page. */
function invalidate(slug?: string, previousSlug?: string) {
  updateTag(tags.divisions());
  if (slug) updateTag(tags.division(slug));
  // A renamed slug leaves the old URL cached under its old tag.
  if (previousSlug && previousSlug !== slug) updateTag(tags.division(previousSlug));
}

export async function saveDivision(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = DivisionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  const data = {
    title: input.title,
    slug: input.slug,
    category: input.category,
    summary: input.summary || null,
    body: input.body || null,
    // One capability per line in the textarea; blank lines dropped.
    capabilities: (input.capabilities ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    heroImageId: input.heroImageId || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    order: input.order,
  };

  const existing = id
    ? await db.division.findUnique({ where: { id }, select: { slug: true } })
    : null;

  // Surface the collision as a field error rather than letting the unique
  // constraint surface as a 500.
  const clash = await db.division.findFirst({
    where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Another division already uses this slug." },
    };
  }

  if (id) {
    await db.division.update({ where: { id }, data });

    // A renamed slug orphans the old URL, which may already be indexed or
    // linked from elsewhere. Record a 301 so it keeps resolving.
    if (existing && existing.slug !== input.slug) {
      await recordSlugChange(
        `/divisions/${existing.slug}`,
        `/divisions/${input.slug}`,
      );
      updateTag(tags.redirects());
    }
  } else {
    const created = await db.division.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: id === null ? "create" : "update",
      entityType: "Division",
      entityId: id!,
      summary: input.title,
    },
  });

  invalidate(input.slug, existing?.slug);
  redirect("/admin/divisions");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) {
    return { error: "Editors cannot publish. Ask an admin to review it." };
  }

  const division = await db.division.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
    },
    select: { slug: true, title: true },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: publish ? "publish" : "unpublish",
      entityType: "Division",
      entityId: id,
      summary: division.title,
    },
  });

  invalidate(division.slug);
  return {};
}

export async function deleteDivision(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete divisions." };

  const division = await db.division.findUnique({
    where: { id },
    select: { slug: true, title: true, _count: { select: { projects: true, services: true } } },
  });
  if (!division) return { error: "That division no longer exists." };

  // Projects and services point at this row with SET_NULL, so deleting would
  // silently orphan them. Say so instead.
  const linked = division._count.projects + division._count.services;
  if (linked > 0) {
    return {
      error: `"${division.title}" still has ${linked} linked item${linked === 1 ? "" : "s"}. Reassign them first.`,
    };
  }

  await db.division.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "Division",
      entityId: id,
      summary: division.title,
    },
  });

  invalidate(division.slug);
  return {};
}
