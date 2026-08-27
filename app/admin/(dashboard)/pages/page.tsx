import type { Metadata } from "next";
import Link from "next/link";

import PageTable, { type PageSummary } from "./PageTable";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.page.findMany({
    orderBy: { slug: "asc" },
    select: { id: true, title: true, slug: true, body: true, status: true },
  });

  const pages: PageSummary[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    hasBody: Boolean(r.body && r.body.trim()),
    published: r.status === "PUBLISHED",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            Pages
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            Editorial copy for standalone pages such as About.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          New page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">
            No pages yet. /about is already live using generated fallback copy —
            create an About page here to replace it with your own words.
          </p>
        </div>
      ) : (
        <PageTable pages={pages} canManage={user ? canPublish(user.role) : false} />
      )}
    </div>
  );
}
