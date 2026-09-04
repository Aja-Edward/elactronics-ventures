import type { Metadata } from "next";
import Image from "next/image";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL } from "@/lib/about";
import { formatEventDate, getGalleryAlbums } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Events Gallery",
  description:
    "Photography from Elatronics Ventures events, site visits and project milestones.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();
  const populated = albums.filter((a: (typeof albums)[number]) => a.images.length > 0);

  return (
    <>
      <PageHero
        pageSlug="gallery"
        title="Events Gallery"
        trail={ABOUT_TRAIL}
        intro="Photography from our events, site visits and project milestones."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {populated.length === 0 ? (
            <EmptyNotice>Event photography will be published here shortly.</EmptyNotice>
          ) : (
            <div className="space-y-16">
              {populated.map((album: (typeof populated)[number]) => {
                const date = formatEventDate(album.eventDate);

                return (
                  <div key={album.id}>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                      {album.title}
                    </h2>
                    {date && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-steel-500">
                        {date}
                      </p>
                    )}
                    {album.description && (
                      <p className="prose-measure mt-3 text-sm leading-relaxed text-steel-700">
                        {album.description}
                      </p>
                    )}

                    <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {album.images.map((image: (typeof album.images)[number]) => (
                        <li
                          key={image.id}
                          className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface"
                        >
                          <Image
                            src={image.media.secureUrl}
                            alt={image.media.alt || album.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
