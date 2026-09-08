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

/**
 * CRUD for a division's sub-pages.
 *
 * These are `Service` rows pointing at a division, and each becomes a page at
 * /divisions/<division>/<service>. The procurement division is the reason this
 * screen exists: the reference site records close to ninety supply lines
 * beneath it, each with its own photograph and page, and until now the only
 * way to add one was by hand in the database.
 *
 * Every query is scoped by `divisionId` as well as by the row id, so a service
 * id typed into the URL cannot be read — let alone re-saved — through the
 * wrong division's screen, and a skid-package system (which belongs to a
 * group rather than a division) cannot be reached here at all.
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

function toData(divisionId: string, v: Values) {
  return {
    title: v.title,
    slug: v.slug,
    divisionId,
    // Explicitly null: `group` is what marks a skid-package system, and a row
    // owned by a division must never carry one, or it would surface in both
    // places at once.
    group: null,
    summary: v.summary || null,
    body: v.body || null,
    heroImageId: v.heroImageId || null,
    seoTitle: v.seoTitle || null,
    seoDescription: v.seoDescription || null,
    order: v.order,
  };
}

/**
 * The division page lists its sub-pages, so it has to refresh too — not just
 * the sub-page's own route.
 */
function invalidate(divisionSlug: string, slug: string, previousSlug?: string) {
  updateTag(tags.divisions());
  updateTag(tags.division(divisionSlug));
  updateTag(tags.services());
  updateTag(tags.service(slug));
  if (previousSlug && previousSlug !== slug) updateTag(tags.service(previousSlug));
}

/** The parent, or null when the id names no division. */
async function parentDivision(divisionId: string) {
  return db.division.findUnique({
    where: { id: divisionId },
    select: { id: true, slug: true },
  });
}

export async function save(
  divisionId: string,
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const division = await parentDivision(divisionId);
  if (!division) return { error: "That division no longer exists." };

  const existing = id
    ? await db.service.findFirst({ where: { id, divisionId }, select: { slug: true } })
    : null;

  // An id that does not belong to this division must not fall through to a
  // create — that would silently produce a duplicate row.
  if (id && !existing) return { error: "That sub-page belongs to another division." };

  const result = await saveResource({
    id,
    formData,
    schema: Schema,
    entityType: "Service",
    tag: tags.services(),
    summary: (v) => v.title,
    // The slug is unique across every Service, not only within this division,
    // so a collision with another division's page or a skid-package system has
    // to surface on the field.
    uniqueField: "slug",
    create: (v) =>
      db.service.create({ data: toData(division.id, v), select: { id: true } }),
    update: (rowId, v) =>
      db.service.update({ where: { id: rowId }, data: toData(division.id, v) }),
  });

  if (result.error) return result;

  const slug = String(formData.get("slug") ?? "");

  // A renamed slug orphans the old URL, which may already be indexed or linked
  // from elsewhere. Record a 301 so it keeps resolving.
  if (existing && existing.slug !== slug) {
    await recordSlugChange(
      `/divisions/${division.slug}/${existing.slug}`,
      `/divisions/${division.slug}/${slug}`,
    );
    updateTag(tags.redirects());
  }

  invalidate(division.slug, slug, existing?.slug);
  redirect(`/admin/divisions/${divisionId}/services`);
}

export async function setPublished(
  divisionId: string,
  id: string,
  publish: boolean,
): Promise<SaveState> {
  const division = await parentDivision(divisionId);
  if (!division) return { error: "That division no longer exists." };

  // Checked before the shared helper runs, so an id from another division is
  // refused rather than published through this screen.
  const owned = await db.service.findFirst({
    where: { id, divisionId },
    select: { id: true },
  });
  if (!owned) return { error: "That sub-page belongs to another division." };

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

  if (slug) invalidate(division.slug, slug);
  return result;
}

export async function remove(divisionId: string, id: string): Promise<SaveState> {
  const division = await parentDivision(divisionId);
  if (!division) return { error: "That division no longer exists." };

  let slug: string | null = null;

  const result = await removeResource({
    id,
    entityType: "Service",
    tag: tags.services(),
    find: async (rowId) => {
      const row = await db.service.findFirst({
        where: { id: rowId, divisionId },
        select: { slug: true, title: true },
      });
      if (!row) return null;
      slug = row.slug;
      return { summary: row.title };
    },
    remove: (rowId) => db.service.delete({ where: { id: rowId } }),
  });

  if (slug) invalidate(division.slug, slug);
  return result;
}
