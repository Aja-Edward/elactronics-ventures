"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { MediaOption } from "./MediaPicker";

/**
 * Picks an ordered set of images for a gallery album.
 *
 * MediaPicker handles the single-image case, which is every other resource on
 * the site. An album is different in two ways: it holds many images, and the
 * order they appear in is an editorial decision rather than an accident of
 * upload time. So selection and sequence are both explicit here.
 *
 * The ids post as one comma-separated hidden field. That keeps the whole thing
 * inside the surrounding form — no separate save button, no half-saved album
 * if the editor navigates away mid-edit.
 */
export default function AlbumImagePicker({
  name,
  media,
  defaultValue,
}: {
  name: string;
  media: MediaOption[];
  defaultValue: string[];
}) {
  // Ids of images that have since been deleted from the media library would
  // otherwise post back and fail the write, so they are dropped on load.
  const known = new Set(media.map((m) => m.id));
  const [selected, setSelected] = useState<string[]>(
    defaultValue.filter((id) => known.has(id)),
  );

  const byId = new Map(media.map((m) => [m.id, m]));

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  const move = (index: number, delta: number) =>
    setSelected((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="space-y-4 rounded-lg border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
          Album images
        </p>
        <p className="text-xs text-steel-500">
          {selected.length === 0
            ? "None selected — the album stays hidden until it has at least one."
            : `${selected.length} selected, shown in this order.`}
        </p>
      </div>

      <input type="hidden" name={name} value={selected.join(",")} />

      {selected.length > 0 && (
        <ol className="flex flex-wrap gap-3">
          {selected.map((id, index) => {
            const m = byId.get(id);
            if (!m) return null;

            return (
              <li key={id} className="w-28 space-y-1">
                <div className="relative aspect-square overflow-hidden rounded border border-brand-900 bg-surface">
                  <Image
                    src={m.secureUrl}
                    alt={m.alt ?? ""}
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                  <span className="absolute left-1 top-1 rounded bg-brand-900 px-1.5 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} earlier`}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-30"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-accent-700 hover:bg-accent-50"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === selected.length - 1}
                    aria-label={`Move image ${index + 1} later`}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-30"
                  >
                    &rarr;
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-t border-brand-50 pt-4">
        <p className="mb-2 text-xs text-steel-500">
          Tap to add or remove from the album.
        </p>

        {media.length === 0 ? (
          <p className="text-sm text-steel-700">
            No media yet.{" "}
            <Link href="/admin/media" className="font-semibold text-brand-900 underline">
              Upload some first
            </Link>
            .
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {media.map((m) => {
              const position = selected.indexOf(m.id);
              const picked = position !== -1;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  title={m.publicId}
                  aria-pressed={picked}
                  className={`relative aspect-square overflow-hidden rounded border bg-surface ${
                    picked
                      ? "border-brand-900 ring-2 ring-brand-900/25"
                      : "border-brand-200 hover:border-brand-300"
                  }`}
                >
                  <Image
                    src={m.secureUrl}
                    alt={m.alt ?? ""}
                    fill
                    sizes="120px"
                    className="object-contain p-1"
                  />
                  {picked && (
                    <span className="absolute left-1 top-1 rounded bg-brand-900 px-1.5 text-[11px] font-bold text-white">
                      {position + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
