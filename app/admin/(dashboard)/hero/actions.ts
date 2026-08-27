"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

/** Internal paths only — an off-site hero CTA is almost always a mistake. */
const internalPath = z
  .string()
  .trim()
  .regex(/^\/[a-z0-9\-/]*$/i, "Use an internal path such as /divisions.")
  .optional()
  .or(z.literal(""));

const SlideSchema = z.object({
  title: z.string().trim().min(4, "A headline is required.").max(140),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  imageId: z.string().trim().optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(40).optional().or(z.literal("")),
  ctaHref: internalPath,
  ctaAltLabel: z.string().trim().max(40).optional().or(z.literal("")),
  ctaAltHref: internalPath,
  order: z.coerce.number().int().min(0).max(999),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

export async function saveSlide(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = SlideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;

  // A label with no destination renders a button that goes nowhere, and a
  // destination with no label renders nothing at all. Catch both here.
  if (Boolean(d.ctaLabel) !== Boolean(d.ctaHref)) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { ctaHref: "A button needs both a label and a link." },
    };
  }
  if (Boolean(d.ctaAltLabel) !== Boolean(d.ctaAltHref)) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { ctaAltHref: "A button needs both a label and a link." },
    };
  }

  const data = {
    title: d.title,
    subtitle: d.subtitle || null,
    imageId: d.imageId || null,
    ctaLabel: d.ctaLabel || null,
    ctaHref: d.ctaHref || null,
    ctaAltLabel: d.ctaAltLabel || null,
    ctaAltHref: d.ctaAltHref || null,
    order: d.order,
  };

  if (id) {
    await db.heroSlide.update({ where: { id }, data });
  } else {
    const created = await db.heroSlide.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "update",
      entityType: "HeroSlide",
      entityId: id!,
      summary: d.title,
    },
  });

  updateTag(tags.heroSlides());
  redirect("/admin/hero");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const slide = await db.heroSlide.update({
    where: { id },
    data: { status: publish ? "PUBLISHED" : "DRAFT" },
    select: { title: true },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: publish ? "publish" : "unpublish",
      entityType: "HeroSlide",
      entityId: id,
      summary: slide.title,
    },
  });

  updateTag(tags.heroSlides());
  return {};
}

export async function deleteSlide(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const slide = await db.heroSlide.findUnique({ where: { id }, select: { title: true } });
  if (!slide) return { error: "That slide no longer exists." };

  await db.heroSlide.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "HeroSlide",
      entityId: id,
      summary: slide.title,
    },
  });

  updateTag(tags.heroSlides());
  return {};
}
