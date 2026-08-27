"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache-tags";
import { db } from "@/lib/db";

const CertificationSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  issuer: z.string().trim().max(120).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  fileId: z.string().trim().optional().or(z.literal("")),
  issuedAt: z.string().trim().optional().or(z.literal("")),
  expiresAt: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

/** "" -> null, otherwise a Date. Invalid input is rejected upstream. */
function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveCertification(
  id: string | null,
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = CertificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  const issuedAt = toDate(input.issuedAt);
  const expiresAt = toDate(input.expiresAt);

  // A certificate that expired before it was issued is a data-entry slip, and
  // publishing it would misstate an accreditation.
  if (issuedAt && expiresAt && expiresAt < issuedAt) {
    return {
      error: "Expiry cannot be before the issue date.",
      fieldErrors: { expiresAt: "Must be after the issue date." },
    };
  }

  const data = {
    name: input.name,
    issuer: input.issuer || null,
    reference: input.reference || null,
    description: input.description || null,
    fileId: input.fileId || null,
    issuedAt,
    expiresAt,
    order: input.order,
  };

  if (id) {
    await db.certification.update({ where: { id }, data });
  } else {
    const created = await db.certification.create({ data });
    id = created.id;
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "update",
      entityType: "Certification",
      entityId: id!,
      summary: input.name,
    },
  });

  updateTag(tags.certifications());
  redirect("/admin/certifications");
}

export async function setPublished(id: string, publish: boolean): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const cert = await db.certification.update({
    where: { id },
    data: { status: publish ? "PUBLISHED" : "DRAFT" },
    select: { name: true },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: publish ? "publish" : "unpublish",
      entityType: "Certification",
      entityId: id,
      summary: cert.name,
    },
  });

  updateTag(tags.certifications());
  return {};
}

export async function deleteCertification(id: string): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const cert = await db.certification.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!cert) return { error: "That certification no longer exists." };

  // Only the record goes; the image stays in the media library so it can be
  // reused, and is removed deliberately from there if unwanted.
  await db.certification.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "delete",
      entityType: "Certification",
      entityId: id,
      summary: cert.name,
    },
  });

  updateTag(tags.certifications());
  return {};
}
