import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostForm, { type PostValues } from "../PostForm";
import type { MediaOption } from "@/components/admin/MediaPicker";
import { db } from "@/lib/db";

export const instant = false;
export const metadata: Metadata = { title: "Edit article" };

const BLANK: PostValues = {
  id: null, title: "", slug: "", type: "NEWS", excerpt: "", body: "",
  author: "", tags: [], heroImageId: null, seoTitle: "", seoDescription: "", isFeatured: false,
};

export default async function EditPostPage({ params }: PageProps<"/admin/news/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [post, media] = await Promise.all([
    creating ? null : db.post.findUnique({
      where: { id },
      select: {
        id: true, title: true, slug: true, type: true, excerpt: true, body: true,
        author: true, tags: true, heroImageId: true, seoTitle: true,
        seoDescription: true, isFeatured: true,
      },
    }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" }, take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !post) notFound();

  const values: PostValues = post
    ? {
        id: post.id, title: post.title, slug: post.slug, type: post.type,
        excerpt: post.excerpt ?? "", body: post.body ?? "", author: post.author ?? "",
        tags: post.tags, heroImageId: post.heroImageId,
        seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "",
        isFeatured: post.isFeatured,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New article" : values.title}
      </h1>
      <PostForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
