import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Equipment is an owned-asset register, not marketing copy. Specs live in a
 * structured `specs` JSON column so "40,000 psi" stays a retrievable fact
 * rather than being buried in prose — which matters when a client is checking
 * whether the right kit is actually available.
 */

export type EquipmentSpec = { label: string; value: string };

/** The JSON column is untyped at the database level, so narrow it on read. */
export function parseSpecs(value: unknown): EquipmentSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "label" in entry &&
      "value" in entry &&
      typeof entry.label === "string" &&
      typeof entry.value === "string" &&
      entry.label.trim()
    ) {
      return [{ label: entry.label.trim(), value: entry.value.trim() }];
    }
    return [];
  });
}

export async function getPublishedEquipment() {
  "use cache";
  cacheTag(tags.equipment());
  cacheLife("days");

  const rows = await db.equipment.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      quantity: true,
      specs: true,
      image: { select: { secureUrl: true, alt: true } },
    },
  });

  return rows.map((row) => ({ ...row, specs: parseSpecs(row.specs) }));
}
