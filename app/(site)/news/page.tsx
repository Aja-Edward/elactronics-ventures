import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import PostGrid from "@/components/site/PostGrid";
import { getPublishedPosts } from "@/lib/news";

export const metadata: Metadata = {
  title: "Our News",
  description: "Company news and project updates from Elatronics Ventures.",
  alternates: { canonical: "/news" },
};

export default async function NewsIndexPage() {
  // News only. Longer-form commentary is filed as BLOG and listed at /blog,
  // as the reference site separates the two.
  const posts = await getPublishedPosts("NEWS");

  return (
    <>
      <PageHero
        pageSlug="news"
        title="Our News"
        crumb="News"
        intro="Company updates, project milestones and notes from the field."
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
