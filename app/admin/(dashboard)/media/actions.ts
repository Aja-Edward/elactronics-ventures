"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { destroyAsset, isOwnedAsset } from "@/lib/cloudinary";
import { db } from "@/lib/db";

/**
 * Records an asset in the Media table after the browser has uploaded it to
 * Cloudinary, and handles deletion.
 *
 * Every action re-checks the session server-side. A Server Action is a public
 * HTTP endpoint — being rendered inside a protected layout guarantees nothing
 * about who eventually calls it.
 */

const RecordSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  secureUrl: z.string().url(),
  resourceType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).default("IMAGE"),
  format: z.string().nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  bytes: z.number().int().nonnegative().nullable().optional(),
  folder: z.string().nullable().optional(),
  alt: z.string().max(300).nullable().optional(),
});

export type RecordResult = { ok: true; id: string } | { ok: false; error: string };

export async function recordUpload(input: unknown): Promise<RecordResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const parsed = RecordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That upload response was not in the expected shape." };
  }

  const data = parsed.data;

  // The client supplies these values, so verify the asset really is ours
  // before writing a row that would let the CMS manage — and later delete —
  // something belonging to another project in this shared account.
  if (!isOwnedAsset(data.publicId)) {
    return { ok: false, error: "That asset is outside this site's media folder." };
  }

  const media = await db.media.upsert({
    where: { publicId: data.publicId },
    create: {
      publicId: data.publicId,
      url: data.url,
      secureUrl: data.secureUrl,
      resourceType: data.resourceType,
      format: data.format ?? null,
      width: data.width ?? null,
      height: data.height ?? null,
      bytes: data.bytes ?? null,
      folder: data.folder ?? null,
      alt: data.alt ?? null,
    },
    update: {
      secureUrl: data.secureUrl,
      alt: data.alt ?? undefined,
    },
  });

  revalidatePath("/admin/media");
  return { ok: true, id: media.id };
}

export async function updateAlt(id: string, alt: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await db.media.update({
    where: { id },
    data: { alt: alt.trim().slice(0, 300) || null },
  });

  revalidatePath("/admin/media");
}

export type DeleteResult = { ok: boolean; error?: string };

export async function deleteMedia(id: string): Promise<DeleteResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (user.role === "EDITOR") {
    return { ok: false, error: "Editors cannot delete media." };
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { ok: false, error: "That file no longer exists." };

  try {
    await destroyAsset(media.publicId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Cloudinary delete failed.",
    };
  }

  await db.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { ok: true };
}
