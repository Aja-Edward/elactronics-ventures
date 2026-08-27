"use client";

import Image from "next/image";

import { deletePost, setPublished } from "./actions";
import RowActions, { StatusPill } from "@/components/admin/RowActions";

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  type: "NEWS" | "BLOG";
  author: string | null;
  publishedLabel: string | null;
  isFeatured: boolean;
  published: boolean;
  imageUrl: string | null;
};

export default function PostTable({ posts, canManage }: { posts: PostSummary[]; canManage: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-100 bg-surface">
              {["Article", "Type", "Published", "Status", ""].map((h, i) => (
                <th key={h || i} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 4 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded border border-brand-100 bg-surface">
                      {post.imageUrl && <Image src={post.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-brand-900">
                        {post.title}
                        {post.isFeatured && (
                          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
                            Featured
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-steel-500">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-steel-700">
                  {post.type === "BLOG" ? "Article" : "News"}
                </td>
                <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">
                  {post.publishedLabel ?? "—"}
                </td>
                <td className="px-4 py-3"><StatusPill published={post.published} /></td>
                <td className="px-4 py-3">
                  <RowActions
                    editHref={`/admin/news/${post.id}`}
                    published={post.published}
                    canManage={canManage}
                    onTogglePublish={(p) => setPublished(post.id, p)}
                    onDelete={() => deletePost(post.id)}
                    confirmMessage={`Delete "${post.title}" permanently?`}
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
