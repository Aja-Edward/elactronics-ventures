import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import DivisionForm, {
  type DivisionValues,
  type MediaOption,
} from "../DivisionForm";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit division" };

const BLANK: DivisionValues = {
  id: null,
  title: "",
  slug: "",
  category: "SERVICE_OFFERING",
  summary: "",
  body: "",
  capabilities: [],
  heroImageId: null,
  seoTitle: "",
  seoDescription: "",
  order: 0,
};

export default async function EditDivisionPage({
  params,
}: PageProps<"/admin/divisions/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [division, media] = await Promise.all([
    creating
      ? null
      : db.division.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            summary: true,
            body: true,
            capabilities: true,
            heroImageId: true,
            seoTitle: true,
            seoDescription: true,
            order: true,
          },
        }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !division) notFound();

  const values: DivisionValues = division
    ? {
        id: division.id,
        title: division.title,
        slug: division.slug,
        category: division.category,
        summary: division.summary ?? "",
        body: division.body ?? "",
        capabilities: division.capabilities,
        heroImageId: division.heroImageId,
        seoTitle: division.seoTitle ?? "",
        seoDescription: division.seoDescription ?? "",
        order: division.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          {creating ? "New division" : values.title}
        </h1>
        {/* Only once the division exists: sub-pages have to hang off a saved
            row, and offering the link while creating would lead nowhere. */}
        {division && (
          <Link
            href={`/admin/divisions/${division.id}/services`}
            className="rounded border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
          >
            Sub-pages
          </Link>
        )}
      </div>
      <DivisionForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
