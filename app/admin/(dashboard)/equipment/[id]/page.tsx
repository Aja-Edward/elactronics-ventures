import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EquipmentForm, { type EquipmentValues } from "../EquipmentForm";
import type { MediaOption } from "@/components/admin/MediaPicker";
import { db } from "@/lib/db";
import { parseSpecs } from "@/lib/equipment";

export const instant = false;
export const metadata: Metadata = { title: "Edit equipment" };

const BLANK: EquipmentValues = {
  id: null, name: "", slug: "", description: "", category: "",
  quantity: "", imageId: null, specs: [], order: 0,
};

export default async function EditEquipmentPage({ params }: PageProps<"/admin/equipment/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [item, media] = await Promise.all([
    creating ? null : db.equipment.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, description: true, category: true, quantity: true, imageId: true, specs: true, order: true },
    }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" }, take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !item) notFound();

  const values: EquipmentValues = item
    ? {
        id: item.id, name: item.name, slug: item.slug,
        description: item.description ?? "", category: item.category ?? "",
        quantity: item.quantity != null ? String(item.quantity) : "",
        imageId: item.imageId, specs: parseSpecs(item.specs), order: item.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New equipment" : values.name}
      </h1>
      <EquipmentForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
