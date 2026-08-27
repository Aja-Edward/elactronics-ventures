"use client";

import Image from "next/image";

import { deleteSlide, setPublished } from "./actions";
import RowActions, { StatusPill } from "@/components/admin/RowActions";

export type SlideSummary = {
  id: string;
  title: string;
  subtitle: string | null;
  order: number;
  published: boolean;
  imageUrl: string | null;
};

export default function SlideTable({
  slides,
  canManage,
}: {
  slides: SlideSummary[];
  canManage: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-100 bg-surface">
              {["Slide", "Order", "Status", ""].map((h, i) => (
                <th
                  key={h || i}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 3 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {slides.map((slide) => (
              <tr key={slide.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-brand-100 bg-surface">
                      {slide.imageUrl && (
                        <Image src={slide.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-brand-900">{slide.title}</p>
                      {slide.subtitle && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-steel-500">
                          {slide.subtitle}
                        </p>
                      )}
                      {!slide.imageUrl && (
                        <p className="mt-0.5 text-xs font-medium text-accent-700">
                          No background image
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">{slide.order}</td>
                <td className="px-4 py-3">
                  <StatusPill published={slide.published} />
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    editHref={`/admin/hero/${slide.id}`}
                    published={slide.published}
                    canManage={canManage}
                    onTogglePublish={(p) => setPublished(slide.id, p)}
                    onDelete={() => deleteSlide(slide.id)}
                    confirmMessage={`Delete the slide "${slide.title}"?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
