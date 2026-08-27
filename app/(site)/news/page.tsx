import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { formatPostDate, getPublishedPosts } from "@/lib/news";

export const metadata: Metadata = {
  title: "News",
  description: "Company news, project updates and industry commentary from Elatronics Ventures.",
  alternates: { canonical: "/news" },
};

export default async function NewsIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">News</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            News
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Company updates, project milestones and notes from the field.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-12 text-center">
              <p className="text-sm text-steel-700">No articles published yet.</p>
            </div>
          ) : (
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
                        <p className="mt-2 flex-1 line-clamp-3 text-sm leading-relaxed text-steel-700">
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
          )}
        </div>
      </section>
    </>
  );
}
