import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import PostGrid from "@/components/site/PostGrid";
import { getPublishedPosts } from "@/lib/news";
import { getPageBySlug } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Our News",
  description: "Company news and project updates from Elatronics Ventures.",
  alternates: { canonical: "/news" },
};

export default async function NewsIndexPage() {
  // News only. Longer-form commentary is filed as BLOG and listed at /blog,
  // as the reference site separates the two.
  const [posts, page] = await Promise.all([
    getPublishedPosts("NEWS"),
    getPageBySlug("news"),
  ]);

  return (
    <>
      {/* Heading, standfirst and banner all come from the Page row with slug
          "news", so they are editable without a deploy. The literals below are
          the fallback for no row, an unpublished one, or a field left blank —
          the page must never render a missing heading. */}
      <PageHero
        title={page?.title ?? "Our News"}
        crumb="News"
        intro={
          page?.description ??
          "Company updates, project milestones and notes from the field."
        }
        // The row is already loaded here, so hand the banner over directly
        // rather than have PageHero query the same Page a second time.
        image={page?.heroImage}
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {posts.length === 0 ? (
            <EmptyNotice>No news has been published yet.</EmptyNotice>
          ) : (
            <PostGrid posts={posts} />
          )}
        </div>
      </section>
    </>
  );
}
