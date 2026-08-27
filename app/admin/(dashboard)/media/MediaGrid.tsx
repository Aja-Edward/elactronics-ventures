"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteMedia, updateAlt } from "./actions";

export type MediaItem = {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: "IMAGE" | "VIDEO" | "DOCUMENT";
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  folder: string | null;
  alt: string | null;
};

function humanSize(bytes: number | null): string {
  if (!bytes) return "—";
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MediaGrid({
  items,
  canDelete,
}: {
  items: MediaItem[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(item: MediaItem) {
    if (
      !window.confirm(
        `Delete this file permanently from Cloudinary?\n\n${item.publicId}\n\nAnything using it will lose its image.`,
      )
    )
      return;

    setError(null);
    startTransition(async () => {
      const res = await deleteMedia(item.id);
      if (!res.ok) setError(res.error ?? "Delete failed.");
      else router.refresh();
    });
  }

  function handleAltBlur(item: MediaItem, value: string) {
    if (value.trim() === (item.alt ?? "")) return;
    startTransition(() => updateAlt(item.id, value));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
        <p className="text-sm text-steel-700">
          No files yet. Upload one above to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800"
        >
          {error}
        </p>
      )}

      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${pending ? "opacity-60" : ""}`}
      >
        {items.map((item) => (
          <figure
            key={item.id}
            className="overflow-hidden rounded-lg border border-brand-100 bg-white"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-surface">
              {item.resourceType === "IMAGE" ? (
                <Image
                  src={item.secureUrl}
                  alt={item.alt ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-contain"
                />
              ) : (
                <span className="font-display text-sm font-semibold uppercase tracking-wide text-steel-600">
                  {item.format ?? item.resourceType}
                </span>
              )}
            </div>

            <figcaption className="space-y-2 p-3">
              <p
                className="truncate text-xs font-medium text-brand-900"
                title={item.publicId}
              >
                {item.publicId.split("/").pop()}
              </p>
              <p className="text-[11px] text-steel-500 tabular-nums">
                {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                {humanSize(item.bytes)}
                {item.folder ? ` · ${item.folder.replace("elatronics/", "")}` : ""}
              </p>

              {/* Alt text is edited here rather than at point of use, so it is
                  written once per asset and cannot be forgotten later. */}
              <input
                type="text"
                defaultValue={item.alt ?? ""}
                placeholder="Alt text (describe the image)"
                onBlur={(e) => handleAltBlur(item, e.target.value)}
                className="w-full rounded border border-brand-200 px-2 py-1.5 text-xs text-brand-950 outline-none placeholder:text-steel-400 focus:border-brand-900"
              />

              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={pending}
                  className="text-[11px] font-semibold text-accent-700 hover:text-accent-800 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
