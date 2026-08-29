import { updateTag } from "next/cache";
import type { z } from "zod";

import type { SaveState } from "./form";

import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export { slugify } from "./form";
export type { SaveState } from "./form";

/**
 * Shared plumbing for the admin's create/update/publish/delete actions.
 *
 * Every entity screen repeats the same six steps — check the session, parse
 * the form, write, audit, invalidate the cache tag, return. Seven more About
 * entities would have meant seven more copies, so the steps live here and each
 * entity supplies only what is genuinely its own: its schema, its Prisma
 * calls, its tag and its audit label.
 *
 * The Prisma calls are passed in as closures rather than looked up by model
 * name, which keeps them fully typed — a renamed column is a compile error
 * here, not a runtime failure in production.
 */

/** First message per field, which is all the forms have room to show. */
function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Prisma's unique-constraint error. Slugs are the only unique column on these
 * entities, and colliding on one is an ordinary editing mistake — it deserves
 * a message next to the field, not a 500.
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

async function writeAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
) {
  await db.auditLog.create({
    data: { userId, action, entityType, entityId, summary },
  });
}

export async function saveResource<TValues>(opts: {
  id: string | null;
  formData: FormData;
  schema: z.ZodType<TValues>;
  entityType: string;
  /** Cache tag to invalidate, from lib/cache-tags. */
  tag: string;
  /** Human label for the audit log, e.g. the record's name. */
  summary: (values: TValues) => string;
  create: (values: TValues) => Promise<{ id: string }>;
  update: (id: string, values: TValues) => Promise<unknown>;
  /** Field to blame when a unique constraint trips. */
  uniqueField?: string;
}): Promise<SaveState & { savedId?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = opts.schema.safeParse(Object.fromEntries(opts.formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const values = parsed.data;
  let savedId = opts.id;

  try {
    if (savedId) {
      await opts.update(savedId, values);
    } else {
      savedId = (await opts.create(values)).id;
    }
  } catch (error) {
    if (isUniqueViolation(error) && opts.uniqueField) {
      return {
        error: "That web address is already taken.",
        fieldErrors: { [opts.uniqueField]: "Already used by another record." },
      };
    }
    throw error;
  }

  await writeAudit(user.id, "update", opts.entityType, savedId, opts.summary(values));
  updateTag(opts.tag);

  return { savedId };
}

export async function publishResource(opts: {
  id: string;
  entityType: string;
  tag: string;
  publish: boolean;
  /** Sets the status and returns something to name in the audit log. */
  update: (id: string, published: boolean) => Promise<{ summary: string }>;
}): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot publish." };

  const { summary } = await opts.update(opts.id, opts.publish);

  await writeAudit(
    user.id,
    opts.publish ? "publish" : "unpublish",
    opts.entityType,
    opts.id,
    summary,
  );
  updateTag(opts.tag);

  return {};
}

export async function removeResource(opts: {
  id: string;
  entityType: string;
  tag: string;
  /** Returns null when the record has already gone. */
  find: (id: string) => Promise<{ summary: string } | null>;
  remove: (id: string) => Promise<unknown>;
}): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!canPublish(user.role)) return { error: "Editors cannot delete." };

  const found = await opts.find(opts.id);
  if (!found) return { error: "That record no longer exists." };

  // Only the record goes. Any attached image stays in the media library so it
  // can be reused, and is removed deliberately from there if unwanted.
  await opts.remove(opts.id);

  await writeAudit(user.id, "delete", opts.entityType, opts.id, found.summary);
  updateTag(opts.tag);

  return {};
}

/** Images offered by the media picker on every resource form. */
export async function getMediaOptions() {
  return db.media.findMany({
    where: { resourceType: "IMAGE" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, secureUrl: true, alt: true, publicId: true },
  });
}
