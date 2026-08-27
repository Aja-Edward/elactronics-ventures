import type { Metadata } from "next";
import Link from "next/link";

import PostTable, { type PostSummary } from "./PostTable";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPostDate } from "@/lib/news";

export const instant = false;
export const metadata: Metadata = { title: "News" };

export default async function NewsAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, slug: true, type: true, author: true,
      publishedAt: true, isFeatured: true, status: true,
      heroImage: { select: { secureUrl: true } },
    },
  });

  const posts: PostSummary[] = rows.map((r) => ({
    id: r.id, title: r.title, slug: r.slug, type: r.type, author: r.author,
    publishedLabel: formatPostDate(r.publishedAt),
    isFeatured: r.isFeatured, published: r.status === "PUBLISHED",
    imageUrl: r.heroImage?.secureUrl ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">News</h1>
          <p className="mt-1 text-sm text-steel-700">
            {posts.filter((p) => p.published).length} of {posts.length} published.
          </p>
        </div>
        <Link href="/admin/news/new" className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          New article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">No articles yet.</p>
        </div>
      ) : (
        <PostTable posts={posts} canManage={user ? canPublish(user.role) : false} />
      )}
    </div>
  );
}
