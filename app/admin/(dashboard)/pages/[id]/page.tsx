import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageForm, { type MediaOption, type PageValues } from "../PageForm";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Edit page" };

const BLANK: PageValues = {
  id: null,
  heroImageId: null,
  title: "About Us",
  slug: "about",
  description: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
};

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [page, media] = await Promise.all([
    creating
      ? null
      : db.page.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            body: true,
            seoTitle: true,
            seoDescription: true,
            heroImageId: true,
          },
        }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !page) notFound();

  const values: PageValues = page
    ? {
        id: page.id,
        title: page.title,
        slug: page.slug,
        description: page.description ?? "",
        body: page.body ?? "",
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        heroImageId: page.heroImageId,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New page" : values.title}
      </h1>
      <PageForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
