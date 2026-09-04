"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slugs that already have a route rendering them. Creating a page at a slug
 * with no matching route would produce content nobody can reach, so new pages
 * are restricted to the ones that exist.
 */
/**
 * Slugs a route actually renders. The guard below refuses anything else,
 * because a Page row whose slug no route reads is invisible content an editor
 * has no way to discover is doing nothing.
 *
 * Nested routes are hyphenated: the slug pattern allows no slashes, so
 * /about/awards is reached as "about-awards".
 */
export const ROUTED_SLUGS = [
  "about",
  "about-awards",
  "about-clients",
  "about-faqs",
  "about-governance",
  "about-group-entities",
  "about-history",
  "about-locations",
  "become-our-partner",
  "blog",
  "gallery",
  "news",
  "oem",
  "skid-package-equipment",
] as const;

const PageSchema = z.object({
  title: z.string().trim().min(2, "A title is required.").max(140),
  slug: z.string().trim().regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().max(30000).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  // Empty string means "no banner" — the select renders a None option, and a
  // cleared picker must be able to remove an image, not just fail to set one.
  heroImageId: z.string().trim().optional().or(z.literal("")),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

export async function savePage(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = PageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;

  if (!id && !(ROUTED_SLUGS as readonly string[]).includes(d.slug)) {
    return {
      error: "No page renders that slug yet.",
      fieldErrors: {
        slug: `Currently only: ${ROUTED_SLUGS.join(", ")}. A new slug needs a route building first.`,
      },
    };
  }

  const clash = await db.page.findFirst({
    where: { slug: d.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: "That slug is taken.", fieldErrors: { slug: "Already in use." } };
  }

  const data = {
    title: d.title,
    slug: d.slug,
    description: d.description || null,
    body: d.body || null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    heroImageId: d.heroImageId || null,
  };

  if (id) {
    await db.page.update({ where: { id }, data });
  } else {
    const created = await db.page.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: { userId: user.id, action: "update", entityType: "Page", entityId: id!, summary: d.title },
  });

  updateTag(tags.pages());
  updateTag(tags.page(d.slug));
  redirect("/admin/pages");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const page = await db.page.update({
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
      entityType: "Page",
      entityId: id,
      summary: page.title,
    },
  });

  updateTag(tags.pages());
  updateTag(tags.page(page.slug));
  return {};
}

export async function deletePage(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const page = await db.page.findUnique({ where: { id }, select: { slug: true, title: true } });
  if (!page) return { error: "That page no longer exists." };

  await db.page.delete({ where: { id } });
  await db.auditLog.create({
    data: { userId: user.id, action: "delete", entityType: "Page", entityId: id, summary: page.title },
  });

  updateTag(tags.pages());
  updateTag(tags.page(page.slug));
  return {};
}
