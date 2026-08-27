"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type MediaOption = {
  id: string;
  secureUrl: string;
  alt: string | null;
  publicId: string;
};

/**
 * Picks one image from the media library and writes its id into a hidden
 * input, so the surrounding form posts it like any other field.
 *
 * Uses object-contain rather than cover: this library holds logos, certificate
 * scans and site photographs, and cropping a certificate to fill a square
 * makes it unreadable.
 */
export default function MediaPicker({
  name,
  label = "Image",
  media,
  defaultValue,
}: {
  name: string;
  label?: string;
  media: MediaOption[];
  defaultValue?: string | null;
}) {
  const [selected, setSelected] = useState(defaultValue ?? "");

  return (
    <div className="space-y-3 rounded-lg border border-brand-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
        {label}
      </p>
      <input type="hidden" name={name} value={selected} />

      {media.length === 0 ? (
        <p className="text-sm text-steel-700">
          No media yet.{" "}
          <Link href="/admin/media" className="font-semibold text-brand-900 underline">
            Upload one first
          </Link>
          .
        </p>
      ) : (
        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
          <button
            type="button"
            onClick={() => setSelected("")}
            className={`flex aspect-square items-center justify-center rounded border text-[11px] font-semibold ${
              selected === ""
                ? "border-brand-900 bg-brand-50 text-brand-900"
                : "border-brand-200 text-steel-600 hover:border-brand-300"
            }`}
          >
            None
          </button>
          {media.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              title={m.publicId}
              className={`relative aspect-square overflow-hidden rounded border bg-surface ${
                selected === m.id
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
