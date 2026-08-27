"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PostSchema = z.object({
  title: z.string().trim().min(4, "A title is required.").max(180),
  slug: z
    .string()
    .trim()
    .min(3, "A slug is required.")
    .regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  type: z.enum(["NEWS", "BLOG"]),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().trim().max(20000).optional().or(z.literal("")),
  author: z.string().trim().max(120).optional().or(z.literal("")),
  tagList: z.string().optional(),
  heroImageId: z.string().trim().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  isFeatured: z.union([z.literal("on"), z.literal("")]).optional(),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

export async function savePost(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = PostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;

  const clash = await db.post.findFirst({
    where: { slug: d.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Another article already uses this slug." },
    };
  }

  const data = {
    title: d.title,
    slug: d.slug,
    type: d.type,
    excerpt: d.excerpt || null,
    body: d.body || null,
    author: d.author || null,
    // Comma-separated in the form; stored as a string array.
    tags: (d.tagList ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    heroImageId: d.heroImageId || null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    isFeatured: d.isFeatured === "on",
  };

  const existing = id
    ? await db.post.findUnique({ where: { id }, select: { slug: true } })
    : null;

  if (id) {
    await db.post.update({ where: { id }, data });
    if (existing && existing.slug !== d.slug) {
      await recordSlugChange(`/news/${existing.slug}`, `/news/${d.slug}`);
      updateTag(tags.redirects());
    }
  } else {
    const created = await db.post.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "update",
      entityType: "Post",
      entityId: id!,
      summary: d.title,
    },
  });

  updateTag(tags.posts());
  updateTag(tags.post(d.slug));
  if (existing?.slug && existing.slug !== d.slug) updateTag(tags.post(existing.slug));
  redirect("/admin/news");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const current = await db.post.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!current) return { error: "That article no longer exists." };

  const post = await db.post.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      // Stamp the date on first publish only. Re-publishing after an edit
      // must not reset it — that would reorder the whole listing and make an
      // old article look new. Unpublishing keeps the original date too, so
      // re-publishing later restores its real place in the timeline.
      ...(publish && !current.publishedAt ? { publishedAt: new Date() } : {}),
    },
    select: { slug: true, title: true },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: publish ? "publish" : "unpublish",
      entityType: "Post",
      entityId: id,
      summary: post.title,
    },
  });

  updateTag(tags.posts());
  updateTag(tags.post(post.slug));
  return {};
}

export async function deletePost(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const post = await db.post.findUnique({ where: { id }, select: { slug: true, title: true } });
  if (!post) return { error: "That article no longer exists." };

  await db.post.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "Post",
      entityId: id,
      summary: post.title,
    },
  });

  updateTag(tags.posts());
  updateTag(tags.post(post.slug));
  return {};
}
