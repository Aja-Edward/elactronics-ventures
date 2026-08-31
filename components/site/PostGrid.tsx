import Image from "next/image";
import Link from "next/link";

import { formatPostDate } from "@/lib/news";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  type: "NEWS" | "BLOG";
  author: string | null;
  publishedAt: Date | null;
  heroImage: { secureUrl: string; alt: string | null } | null;
};

/**
 * The article card grid, shared by /news and /blog.
 *
 * Both listings read the same model and differ only in which `type` they
 * filter to, so the markup lives here rather than being written out twice and
 * left to drift.
 *
 * Every card links to /news/[slug] whatever the post's type: news and blog
 * share one slug space, so an article keeps its URL if an editor reclassifies
 * it.
 */
export default function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/news/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-lg border border-brand-100 bg-white transition-colors hover:border-brand-300"
          >
            <div className="relative aspect-[16/10] bg-surface">
              {post.heroImage ? (
                <Image
                  src={post.heroImage.secureUrl}
                  alt={post.heroImage.alt || post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-steel-400">
                  {post.type === "BLOG" ? "Article" : "News"}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-accent-600">
                {post.type === "BLOG" ? "Article" : "News"}
              </span>
              <h2 className="mt-1.5 font-display text-base font-semibold leading-snug text-brand-900 group-hover:text-accent-600">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-steel-700">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-4 text-xs text-steel-500">
                {[formatPostDate(post.publishedAt), post.author].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
