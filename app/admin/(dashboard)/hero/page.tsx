import type { Metadata } from "next";
import Link from "next/link";

import SlideTable, { type SlideSummary } from "./SlideTable";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Homepage hero" };

export default async function HeroAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.heroSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, title: true, subtitle: true, order: true, status: true,
      image: { select: { secureUrl: true } },
    },
  });

  const slides: SlideSummary[] = rows.map((r) => ({
    id: r.id, title: r.title, subtitle: r.subtitle, order: r.order,
    published: r.status === "PUBLISHED", imageUrl: r.image?.secureUrl ?? null,
  }));

  const publishedCount = slides.filter((s) => s.published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            Homepage hero
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            {publishedCount} published. Slides rotate every 6.5 seconds, pausing
            on hover.
          </p>
        </div>
        <Link href="/admin/hero/new" className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          New slide
        </Link>
      </div>

      {publishedCount === 0 && slides.length > 0 && (
        <p className="rounded border border-brand-200 bg-surface px-4 py-3 text-sm text-steel-700">
          Nothing published yet, so the homepage is showing its built-in fallback
          hero. Publish a slide to replace it.
        </p>
      )}

      {slides.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">
            No slides yet. The homepage is using its built-in fallback hero.
          </p>
        </div>
      ) : (
        <SlideTable slides={slides} canManage={user ? canPublish(user.role) : false} />
      )}
    </div>
  );
}
