import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration and guards.
 *
 * IMPORTANT — this Cloudinary account is shared with other projects. At the
 * time of writing it holds ~500 assets belonging to a separate multi-tenant
 * school platform, including folders named `students` and `signatures`.
 *
 * Two rules follow from that, and both are enforced below:
 *
 *   1. Everything this application uploads goes under MEDIA_FOLDER_ROOT.
 *   2. This application never lists Cloudinary's asset index and never deletes
 *      a public_id outside that prefix. The media library is backed by our own
 *      `Media` table, so it can only ever show assets this app created.
 *
 * Without those, an Elatronics administrator browsing the media library would
 * be shown other clients' images — including photographs of schoolchildren.
 */

export const MEDIA_FOLDER_ROOT = "elatronics";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

/** Sub-folders permitted under the root. Keeps the library tidy and bounded. */
export const MEDIA_FOLDERS = [
  "hero",
  "divisions",
  "equipment",
  "projects",
  "team",
  "clients",
  "certifications",
  "news",
  "gallery",
  "general",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export function isMediaFolder(value: unknown): value is MediaFolder {
  return (
    typeof value === "string" &&
    (MEDIA_FOLDERS as readonly string[]).includes(value)
  );
}

export function folderPath(folder: MediaFolder): string {
  return `${MEDIA_FOLDER_ROOT}/${folder}`;
}

/**
 * True only for assets this application owns. Every destructive or
 * mutating operation must check this first.
 */
export function isOwnedAsset(publicId: string): boolean {
  return publicId.startsWith(`${MEDIA_FOLDER_ROOT}/`);
}

/**
 * Signs an upload so the browser can send the file straight to Cloudinary.
 *
 * Direct upload rather than proxying through our server, because serverless
 * functions cap request bodies well below the size of a photograph and would
 * make large uploads fail in a confusing way. The signature covers the exact
 * parameters the client will send — Cloudinary rejects the upload if they
 * differ, so the browser cannot redirect the file to another folder.
 */
export function signUpload(folder: MediaFolder): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: folderPath(folder), timestamp };

  const signature = cloudinary.utils.api_sign_request(params, apiSecret!);

  return {
    signature,
    timestamp,
    apiKey: apiKey!,
    cloudName: cloudName!,
    folder: params.folder,
  };
}

/** Deletes an asset, refusing anything outside our own folder. */
export async function destroyAsset(publicId: string): Promise<void> {
  if (!isOwnedAsset(publicId)) {
    throw new Error(
      `Refusing to delete "${publicId}": outside ${MEDIA_FOLDER_ROOT}/. This account is shared with other projects.`,
    );
  }
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export { cloudinary };
