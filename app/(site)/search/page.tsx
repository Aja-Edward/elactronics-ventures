import type { Metadata } from "next";
import Link from "next/link";

import { searchSite } from "@/lib/search";

// Reads searchParams, which is per-request data.
export const instant = false;

export const metadata: Metadata = {
  title: "Search",
  // Search result pages are thin and near-infinite in number; keeping them out
  // of the index avoids wasting crawl budget on them.
  robots: { index: false, follow: true },
};

const KIND_HREF: Record<string, string> = {
  Division: "/divisions",
  Equipment: "/equipment",
  Project: "/projects",
  News: "/news",
  Certification: "/certifications",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();

  const results = query ? await searchSite(query) : [];

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Search</span>
          </nav>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {query ? `Results for “${query}”` : "Search"}
          </h1>

          {/* A plain GET form: it works without JavaScript, and the query
              stays in the URL so results can be linked and bookmarked. */}
          <form action="/search" method="get" className="mt-6 flex max-w-xl gap-2">
            <label htmlFor="site-search-q" className="sr-only">
              Search this site
            </label>
            <input
              id="site-search-q"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search divisions, equipment, projects…"
              className="w-full rounded border border-brand-700 bg-brand-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-steel-400 focus:border-steel-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          {!query ? (
            <p className="text-sm text-steel-700">
              Enter a term above to search divisions, equipment, projects, news
              and certifications.
            </p>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-10">
              <p className="text-sm text-steel-800">
                Nothing matched <strong>“{query}”</strong>.
              </p>
              <p className="mt-3 text-sm text-steel-600">
                Try a broader term, or browse{" "}
                <Link href="/divisions" className="font-semibold text-brand-900 underline">
                  our divisions
                </Link>{" "}
                and{" "}
                <Link href="/equipment" className="font-semibold text-brand-900 underline">
                  equipment
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-steel-600">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              <ul className="mt-5 divide-y divide-brand-100 border-y border-brand-100">
                {results.map((hit) => (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <Link href={hit.href} className="group flex flex-col gap-1 py-4">
                      <span className="flex items-center gap-2.5">
                        <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">
                          {hit.kind}
                        </span>
                        <span className="font-display text-base font-semibold text-brand-900 group-hover:text-accent-600">
                          {hit.title}
                        </span>
                      </span>
                      {hit.excerpt && (
                        <span className="line-clamp-2 text-sm leading-relaxed text-steel-700">
                          {hit.excerpt}
                        </span>
                      )}
                      <span className="text-xs text-steel-500">
                        {KIND_HREF[hit.kind]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
