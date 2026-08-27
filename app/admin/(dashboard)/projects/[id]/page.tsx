import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectForm, {
  type DivisionOption,
  type ProjectValues,
} from "../ProjectForm";
import type { MediaOption } from "@/components/admin/MediaPicker";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Edit project" };

const BLANK: ProjectValues = {
  id: null,
  title: "",
  slug: "",
  clientName: "",
  industry: "",
  location: "",
  year: "",
  scope: "",
  divisionId: null,
  challenge: "",
  solution: "",
  results: "",
  heroImageId: null,
  seoTitle: "",
  seoDescription: "",
  isFeatured: false,
  order: 0,
};

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [project, media, divisions] = await Promise.all([
    creating
      ? null
      : db.project.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            clientName: true,
            industry: true,
            location: true,
            year: true,
            scope: true,
            divisionId: true,
            challenge: true,
            solution: true,
            results: true,
            heroImageId: true,
            seoTitle: true,
            seoDescription: true,
            isFeatured: true,
            order: true,
          },
        }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
    db.division.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, title: true },
    }),
  ]);

  if (!creating && !project) notFound();

  const values: ProjectValues = project
    ? {
        id: project.id,
        title: project.title,
        slug: project.slug,
        clientName: project.clientName ?? "",
        industry: project.industry ?? "",
        location: project.location ?? "",
        year: project.year != null ? String(project.year) : "",
        scope: project.scope ?? "",
        divisionId: project.divisionId,
        challenge: project.challenge ?? "",
        solution: project.solution ?? "",
        results: project.results ?? "",
        heroImageId: project.heroImageId,
        seoTitle: project.seoTitle ?? "",
        seoDescription: project.seoDescription ?? "",
        isFeatured: project.isFeatured,
        order: project.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New project" : values.title}
      </h1>
      <ProjectForm
        values={values}
        media={media as MediaOption[]}
        divisions={divisions as DivisionOption[]}
      />
    </div>
  );
}
