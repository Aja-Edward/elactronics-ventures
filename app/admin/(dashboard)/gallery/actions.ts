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

/**
 * Gallery album CRUD.
 *
 * The album's images are edited on the same form and posted as one ordered,
 * comma-separated list of media ids. They are rewritten wholesale on save
 * rather than diffed: GalleryImage carries a `@@unique([albumId, order])`, so
 * a partial update that shuffles positions would collide with rows it has not
 * moved yet. Delete-then-insert inside a transaction sidesteps that entirely,
 * and the table is small enough that the cost is irrelevant.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const Schema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Slug may use lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  eventDate: z.string().trim().optional().or(z.literal("")),
  imageIds: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

type Values = z.infer<typeof Schema>;

function toData(v: Values) {
  return {
    title: v.title,
    slug: v.slug,
    description: v.description || null,
    eventDate: toDate(v.eventDate),
    order: v.order,
  };
}

/** "a,b,,a" -> ["a", "b"]. Duplicates would break the per-album order key. */
function parseImageIds(value: string | undefined): string[] {
  const seen = new Set<string>();
  for (const id of (value ?? "").split(",")) {
    const trimmed = id.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

async function replaceImages(albumId: string, mediaIds: string[]) {
  await db.$transaction(async (tx) => {
    await tx.galleryImage.deleteMany({ where: { albumId } });
    if (mediaIds.length === 0) return;
    await tx.galleryImage.createMany({
      data: mediaIds.map((mediaId, order) => ({ albumId, mediaId, order })),
    });
  });
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
    entityType: "GalleryAlbum",
    tag: tags.gallery(),
    summary: (v) => v.title,
    uniqueField: "slug",
    create: (v) => db.galleryAlbum.create({ data: toData(v), select: { id: true } }),
    update: (rowId, v) => db.galleryAlbum.update({ where: { id: rowId }, data: toData(v) }),
  });

  if (result.error) return result;

  // Only reachable once the album row exists, so a new album's images land
  // against the id it was just created with.
  if (result.savedId) {
    await replaceImages(result.savedId, parseImageIds(String(formData.get("imageIds") ?? "")));
  }

  redirect("/admin/gallery");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  return publishResource({
    id,
    entityType: "GalleryAlbum",
    tag: tags.gallery(),
    publish,
    update: async (rowId, published) => {
      const row = await db.galleryAlbum.update({
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
    entityType: "GalleryAlbum",
    tag: tags.gallery(),
    find: async (rowId) => {
      const row = await db.galleryAlbum.findUnique({
        where: { id: rowId },
        select: { title: true },
      });
      return row ? { summary: row.title } : null;
    },
    // GalleryImage cascades from the album, so the join rows go with it. The
    // Media rows themselves stay in the library, as everywhere else.
    remove: (rowId) => db.galleryAlbum.delete({ where: { id: rowId } }),
  });
}
