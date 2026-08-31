"use server";

import { updateTag } from "next/cache";
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
import { recordSlugChange } from "@/lib/redirects";
import { SKID_GROUP } from "@/lib/service-groups";

/**
 * Skid-package system CRUD.
 *
 * These are `Service` rows pinned to `group = SKID_GROUP`, never to a
 * division. Every query below filters on that group as well as the id, so this
 * screen can only ever reach its own rows — a division's services are edited
 * from the division, and an id typed into the URL cannot cross between them.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const Schema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Slug may use lowercase letters, numbers and hyphens only."),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().trim().optional().or(z.literal("")),
  heroImageId: z.string().trim().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    title: v.title,
    slug: v.slug,
    group: SKID_GROUP,
    summary: v.summary || null,
    body: v.body || null,
    heroImageId: v.heroImageId || null,
    seoTitle: v.seoTitle || null,
    seoDescription: v.seoDescription || null,
    order: v.order,
  };
}

/** The list, plus this system's own page under its current and former slug. */
function invalidate(slug: string, previousSlug?: string) {
  updateTag(tags.services());
  updateTag(tags.service(slug));
  if (previousSlug && previousSlug !== slug) updateTag(tags.service(previousSlug));
}

export async function save(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const existing = id
    ? await db.service.findFirst({
        where: { id, group: SKID_GROUP },
        select: { slug: true },
      })
    : null;

  const result = await saveResource({
    id,
    formData,
    schema: Schema,
    entityType: "Service",
    tag: tags.services(),
    summary: (v) => v.title,
    // The slug is unique across every Service, not just this group, so a
    // collision with a division's service has to surface on the field too.
    uniqueField: "slug",
    create: (v) => db.service.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.service.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;

  const slug = String(formData.get("slug") ?? "");

  // A renamed slug orphans the old URL, which may already be indexed or linked
  // from elsewhere. Record a 301 so it keeps resolving.
  if (existing && existing.slug !== slug) {
    await recordSlugChange(
      `/skid-package-equipment/${existing.slug}`,
      `/skid-package-equipment/${slug}`,
    );
    updateTag(tags.redirects());
  }

  invalidate(slug, existing?.slug);
  redirect("/admin/skid-package-equipment");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  let slug: string | null = null;

  const result = await publishResource({
    id,
    entityType: "Service",
    tag: tags.services(),
    publish,
    update: async (rowId, published) => {
      const row = await db.service.update({
        where: { id: rowId },
        data: {
          status: published ? "PUBLISHED" : "DRAFT",
          publishedAt: published ? new Date() : null,
        },
        select: { slug: true, title: true },
      });
      slug = row.slug;
      return { summary: row.title };
    },
  });

  if (slug) invalidate(slug);
  return result;
}

export async function remove(id: string): Promise<SaveState> {
  let slug: string | null = null;

  const result = await removeResource({
    id,
    entityType: "Service",
    tag: tags.services(),
    find: async (rowId) => {
      const row = await db.service.findFirst({
        where: { id: rowId, group: SKID_GROUP },
        select: { slug: true, title: true },
      });
      if (!row) return null;
      slug = row.slug;
      return { summary: row.title };
    },
    remove: (rowId) => db.service.delete({ where: { id: rowId } }),
  });

  if (slug) invalidate(slug);
  return result;
}
