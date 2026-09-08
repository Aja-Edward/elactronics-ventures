import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

import { POST_SECTION, formatPostDate, type PostKind } from "@/lib/news";

/**
 * The article page shared by /news/[slug] and /blog/[slug].
 *
 * The two routes differ only in which kind of post they fetch and what they
 * call the section they belong to. Everything below — the header band, the
 * hero, the Markdown styling, the tag list — is identical, and it is a hundred
 * and fifty lines of it, so the routes are thin wrappers around this rather
 * than two copies drifting apart the first time one of them is touched.
 */

/**
 * Article body styling.
 *
 * Spelled out per element rather than pulling in @tailwindcss/typography: one
 * plugin's worth of opinions for a single page is not a trade this project
 * makes elsewhere, and prose defaults would not match the type scale the rest
 * of the site already uses.
 */
const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-brand-900">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-lg font-semibold text-brand-900">
      {children}
    </h3>
  ),
  // Justified to match .prose-measure elsewhere on the site. Applied per
  // element rather than to the article wrapper, so headings and rules keep
  // their natural alignment.
  p: ({ children }) => (
    <p className="leading-relaxed text-steel-800 hyphens-auto text-justify">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-6 leading-relaxed text-steel-800 hyphens-auto text-justify">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-6 leading-relaxed text-steel-800 hyphens-auto text-justify">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-brand-900">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent-600 pl-4 text-steel-700">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    // Markdown cannot express "same origin", so external links are detected
    // rather than declared, and only those get the new-tab treatment.
    <a
      href={href}
      className="font-medium text-accent-600 underline underline-offset-2 hover:text-accent-700"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-10 border-brand-100" />,
  code: ({ children }) => (
    <code className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-sm text-brand-900">
      {children}
    </code>
  ),
};

export type ArticlePost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  type: PostKind;
  author: string | null;
  tags: string[];
  publishedAt: Date | null;
  heroImage: { secureUrl: string; alt: string | null } | null;
};

export default function ArticlePage({ post }: { post: ArticlePost }) {
  const dateLabel = formatPostDate(post.publishedAt);
  // Breadcrumb, eyebrow and back link all follow the post's own kind, so a
  // reclassified post reads as belonging to its new section throughout.
  const section = POST_SECTION[post.type];

  return (
    <article>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href={section.indexHref} className="hover:text-white">
              {section.label}
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">{post.title}</span>
          </nav>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-400">
            {section.label}
          </p>
          <h1 className="mt-3 text-balance font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-brand-200">
            {[dateLabel, post.author].filter(Boolean).join(" · ")}
          </p>
        </div>
      </section>

      {post.heroImage && (
        <div className="bg-brand-950">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-surface">
              <Image
                src={post.heroImage.secureUrl}
                alt={post.heroImage.alt ?? ""}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          {post.excerpt && (
            <p className="border-l-2 border-accent-600 pl-4 text-lg leading-relaxed text-brand-900">
              {post.excerpt}
            </p>
          )}

          {post.body ? (
            <div className="mt-8 space-y-5">
              {/* Markdown, not paragraph-splitting on blank lines. A long
                  article is mostly structure — the subheadings are how a
                  reader scans it and how search engines read its shape — and
                  splitting on \n\n flattened every one of them into another
                  <p>.

                  react-markdown drops raw HTML unless rehype-raw is added,
                  which it deliberately is not: post bodies come from the
                  admin, so a compromised editor account would otherwise be an
                  XSS vector into every reader's browser. Nothing here uses
                  dangerouslySetInnerHTML. */}
              <Markdown components={markdownComponents}>{post.body}</Markdown>
            </div>
          ) : (
            <p className="mt-8 text-sm text-steel-600">
              This article has no body content yet.
            </p>
          )}

          {post.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2 border-t border-brand-100 pt-6">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded bg-surface px-2.5 py-1 text-xs font-medium text-steel-700"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 border-t border-brand-100 pt-6">
            <Link
              href={section.indexHref}
              className="text-sm font-semibold text-brand-900 hover:text-accent-600"
            >
              &larr; {section.backLabel}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
