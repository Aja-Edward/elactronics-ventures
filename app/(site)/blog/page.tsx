import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import PostGrid from "@/components/site/PostGrid";
import { getPublishedPosts } from "@/lib/news";

export const metadata: Metadata = {
  title: "Our Blog",
  description:
    "Longer-form technical writing and industry commentary from the Elatronics Ventures team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts("BLOG");

  return (
    <>
      <PageHero
        title="Our Blog"
        crumb="Blog"
        intro="Technical notes, lessons from the field and commentary on the sectors we work in."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {posts.length === 0 ? (
            <EmptyNotice>Articles will be published here shortly.</EmptyNotice>
          ) : (
            <PostGrid posts={posts} />
          )}
        </div>
      </section>
    </>
  );
}
