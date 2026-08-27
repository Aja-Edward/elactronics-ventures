import type { Metadata } from "next";

import MediaGrid, { type MediaItem } from "./MediaGrid";
import MediaUploader from "./MediaUploader";
import { getCurrentUser } from "@/lib/auth";
import { isCloudinaryConfigured, MEDIA_FOLDER_ROOT } from "@/lib/cloudinary";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const user = await getCurrentUser();

  /**
   * Listed from our own Media table, never from Cloudinary's asset index.
   * This account is shared with other projects, so querying Cloudinary
   * directly would surface their files — including a school platform's
   * student photographs. Our table only ever contains what this app uploaded.
   */
  const rows = await db.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      publicId: true,
      secureUrl: true,
      resourceType: true,
      format: true,
      width: true,
      height: true,
      bytes: true,
      folder: true,
      alt: true,
    },
  });

  const items = rows as MediaItem[];
  const configured = isCloudinaryConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          Media
        </h1>
        <p className="mt-1 text-sm text-steel-700">
          {items.length} {items.length === 1 ? "file" : "files"} in{" "}
          <code className="text-brand-900">{MEDIA_FOLDER_ROOT}/</code>
        </p>
      </div>

      {!configured ? (
        <div className="rounded-lg border border-accent-200 bg-accent-50 p-5 text-sm text-accent-800">
          Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then restart the server.
        </div>
      ) : (
        <MediaUploader />
      )}

      <MediaGrid items={items} canDelete={user?.role !== "EDITOR"} />
    </div>
  );
}
