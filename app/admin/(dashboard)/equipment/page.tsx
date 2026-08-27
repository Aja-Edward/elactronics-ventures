import type { Metadata } from "next";
import Link from "next/link";

import EquipmentTable, { type EquipmentSummary } from "./EquipmentTable";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSpecs } from "@/lib/equipment";

export const instant = false;
export const metadata: Metadata = { title: "Equipment" };

export default async function EquipmentAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.equipment.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, slug: true, category: true, quantity: true,
      specs: true, order: true, status: true,
      image: { select: { secureUrl: true } },
    },
  });

  const items: EquipmentSummary[] = rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, category: r.category,
    quantity: r.quantity, specCount: parseSpecs(r.specs).length,
    order: r.order, published: r.status === "PUBLISHED",
    imageUrl: r.image?.secureUrl ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">Equipment</h1>
          <p className="mt-1 text-sm text-steel-700">
            {items.filter((i) => i.published).length} of {items.length} published. This is an
            owned-asset register — only list what the company actually holds.
          </p>
        </div>
        <Link href="/admin/equipment/new" className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          New equipment
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">No equipment yet.</p>
        </div>
      ) : (
        <EquipmentTable items={items} canManage={user ? canPublish(user.role) : false} />
      )}
    </div>
  );
}
