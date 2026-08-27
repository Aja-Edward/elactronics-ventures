"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveDivision, type SaveState } from "./actions";

export type MediaOption = {
  id: string;
  secureUrl: string;
  alt: string | null;
  publicId: string;
};

export type DivisionValues = {
  id: string | null;
  title: string;
  slug: string;
  category: "EPCIM" | "SERVICE_OFFERING" | "PROCUREMENT";
  summary: string;
  body: string;
  capabilities: string[];
  heroImageId: string | null;
  seoTitle: string;
  seoDescription: string;
  order: number;
};

const field =
  "w-full rounded border border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/15";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DivisionForm({
  values,
  media,
}: {
  values: DivisionValues;
  media: MediaOption[];
}) {
  const save = saveDivision.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});

  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  // Only auto-derive the slug for new records. Changing it on an existing
  // division breaks its published URL, so that stays a deliberate edit.
  const [slugLocked] = useState(Boolean(values.id));
  const [heroImageId, setHeroImageId] = useState(values.heroImageId ?? "");

  const err = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugLocked) setSlug(slugify(e.target.value));
              }}
              required
              className={field}
            />
            {err("title") && <p className="text-xs text-accent-700">{err("title")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className={`${field} font-mono`}
            />
            <p className="text-xs text-steel-500">
              /divisions/{slug || "…"}
              {slugLocked && " — changing this breaks the existing URL unless you add a redirect."}
            </p>
            {err("slug") && <p className="text-xs text-accent-700">{err("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="summary" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={values.summary}
              rows={3}
              maxLength={400}
              className={field}
              placeholder="One or two sentences, shown on the divisions grid."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              defaultValue={values.body}
              rows={10}
              className={field}
              placeholder="Full description shown on the division's own page."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="capabilities" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Capabilities
            </label>
            <textarea
              id="capabilities"
              name="capabilities"
              defaultValue={values.capabilities.join("\n")}
              rows={6}
              className={field}
              placeholder={"One per line, e.g.\nWeld inspection\nCorrosion mapping"}
            />
            <p className="text-xs text-steel-500">One per line.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Category
              </label>
              <select id="category" name="category" defaultValue={values.category} className={field}>
                <option value="EPCIM">EPCIM</option>
                <option value="SERVICE_OFFERING">Service offering</option>
                <option value="PROCUREMENT">Procurement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="order" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={0}
                max={9999}
                defaultValue={values.order}
                className={field}
              />
              <p className="text-xs text-steel-500">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
              Hero image
            </p>
            <input type="hidden" name="heroImageId" value={heroImageId} />

            {media.length === 0 ? (
              <p className="text-sm text-steel-700">
                No media yet.{" "}
                <Link href="/admin/media" className="font-semibold text-brand-900 underline">
                  Upload some first
                </Link>
                .
              </p>
            ) : (
              <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setHeroImageId("")}
                  className={`flex aspect-square items-center justify-center rounded border text-[11px] font-semibold ${
                    heroImageId === ""
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
                    onClick={() => setHeroImageId(m.id)}
                    title={m.publicId}
                    className={`relative aspect-square overflow-hidden rounded border ${
                      heroImageId === m.id
                        ? "border-brand-900 ring-2 ring-brand-900/25"
                        : "border-brand-200 hover:border-brand-300"
                    }`}
                  >
                    <Image
                      src={m.secureUrl}
                      alt={m.alt ?? ""}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
              Search engine listing
            </p>
            <div className="space-y-1.5">
              <label htmlFor="seoTitle" className="block text-xs font-medium text-steel-600">
                SEO title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                defaultValue={values.seoTitle}
                maxLength={70}
                className={field}
                placeholder={title || "Defaults to the title"}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="seoDescription" className="block text-xs font-medium text-steel-600">
                SEO description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={values.seoDescription}
                rows={3}
                maxLength={180}
                className={field}
                placeholder="Defaults to the summary."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/divisions"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
