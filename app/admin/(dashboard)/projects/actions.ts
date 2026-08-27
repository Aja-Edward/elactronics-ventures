"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Year is bounded rather than free: a project dated 1899 or 2190 is a typo,
 * and on a past-performance record a wrong year misstates the track record.
 */
const CURRENT_YEAR = 2026;

const ProjectSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  clientName: z.string().trim().max(160).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  year: z.string().trim().optional().or(z.literal("")),
  scope: z.string().trim().max(400).optional().or(z.literal("")),
  divisionId: z.string().trim().optional().or(z.literal("")),
  challenge: z.string().trim().max(3000).optional().or(z.literal("")),
  solution: z.string().trim().max(3000).optional().or(z.literal("")),
  results: z.string().trim().max(3000).optional().or(z.literal("")),
  heroImageId: z.string().trim().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
  isFeatured: z.union([z.literal("on"), z.literal("")]).optional(),
  order: z.coerce.number().int().min(0).max(9999),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

export async function saveProject(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = ProjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  let year: number | null = null;
  if (input.year) {
    const n = Number(input.year);
    if (!Number.isInteger(n) || n < 1950 || n > CURRENT_YEAR + 1) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: { year: `Enter a year between 1950 and ${CURRENT_YEAR + 1}.` },
      };
    }
    year = n;
  }

  const clash = await db.project.findFirst({
    where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Another project already uses this slug." },
    };
  }

  const data = {
    title: input.title,
    slug: input.slug,
    clientName: input.clientName || null,
    industry: input.industry || null,
    location: input.location || null,
    year,
    scope: input.scope || null,
    divisionId: input.divisionId || null,
    challenge: input.challenge || null,
    solution: input.solution || null,
    results: input.results || null,
    heroImageId: input.heroImageId || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    isFeatured: input.isFeatured === "on",
    order: input.order,
  };

  const existing = id
    ? await db.project.findUnique({ where: { id }, select: { slug: true } })
    : null;

  if (id) {
    await db.project.update({ where: { id }, data });

    if (existing && existing.slug !== input.slug) {
      await recordSlugChange(`/projects/${existing.slug}`, `/projects/${input.slug}`);
      updateTag(tags.redirects());
    }
  } else {
    const created = await db.project.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "update",
      entityType: "Project",
      entityId: id!,
      summary: input.title,
    },
  });

  updateTag(tags.projects());
  updateTag(tags.project(input.slug));
  if (existing?.slug && existing.slug !== input.slug) updateTag(tags.project(existing.slug));
  redirect("/admin/projects");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const project = await db.project.update({
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
      entityType: "Project",
      entityId: id,
      summary: project.title,
    },
  });

  updateTag(tags.projects());
  updateTag(tags.project(project.slug));
  return {};
}

export async function deleteProject(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const project = await db.project.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });
  if (!project) return { error: "That project no longer exists." };

  // Gallery rows cascade with the project; the underlying media stays in the
  // library so it can be reused elsewhere.
  await db.project.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "Project",
      entityId: id,
      summary: project.title,
    },
  });

  updateTag(tags.projects());
  updateTag(tags.project(project.slug));
  return {};
}
