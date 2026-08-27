import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SlideForm, { type SlideValues } from "../SlideForm";
import type { MediaOption } from "@/components/admin/MediaPicker";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Edit slide" };

const BLANK: SlideValues = {
  id: null, title: "", subtitle: "", imageId: null,
  ctaLabel: "", ctaHref: "", ctaAltLabel: "", ctaAltHref: "", order: 0,
};

export default async function EditSlidePage({ params }: PageProps<"/admin/hero/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [slide, media] = await Promise.all([
    creating ? null : db.heroSlide.findUnique({
      where: { id },
      select: {
        id: true, title: true, subtitle: true, imageId: true,
        ctaLabel: true, ctaHref: true, ctaAltLabel: true, ctaAltHref: true, order: true,
      },
    }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" }, take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !slide) notFound();

  const values: SlideValues = slide
    ? {
        id: slide.id, title: slide.title, subtitle: slide.subtitle ?? "",
        imageId: slide.imageId,
        ctaLabel: slide.ctaLabel ?? "", ctaHref: slide.ctaHref ?? "",
        ctaAltLabel: slide.ctaAltLabel ?? "", ctaAltHref: slide.ctaAltHref ?? "",
        order: slide.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New slide" : "Edit slide"}
      </h1>
      <SlideForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
