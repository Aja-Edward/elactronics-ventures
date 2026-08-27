"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { savePost, type SaveState } from "./actions";
import MediaPicker, { type MediaOption } from "@/components/admin/MediaPicker";

export type PostValues = {
  id: string | null;
  title: string;
  slug: string;
  type: "NEWS" | "BLOG";
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  heroImageId: string | null;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
};

const field =
  "w-full rounded border border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/15";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-steel-600";

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

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PostForm({
  values,
  media,
}: {
  values: PostValues;
  media: MediaOption[];
}) {
  const save = savePost.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugLocked] = useState(Boolean(values.id));
  const err = (k: string) => state.fieldErrors?.[k];

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

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
          <div className="space-y-1.5">
            <label htmlFor="title" className={labelCls}>
              Title
            </label>
            <input
              id="title"
              name="title"
              value={title}
              required
              className={field}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugLocked) setSlug(slugify(e.target.value));
              }}
            />
            {err("title") && <p className="text-xs text-accent-700">{err("title")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className={labelCls}>
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
              /news/{slug || "…"}
              {slugLocked && " — renaming creates a 301 automatically."}
            </p>
            {err("slug") && <p className="text-xs text-accent-700">{err("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="excerpt" className={labelCls}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={values.excerpt}
              rows={3}
              maxLength={400}
              className={field}
              placeholder="Shown on the listing and used as the search description."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body" className={labelCls}>
              Article
            </label>
            <textarea
              id="body"
              name="body"
              defaultValue={values.body}
              rows={18}
              maxLength={20000}
              className={field}
              placeholder="Leave a blank line between paragraphs."
            />
            <p className="text-xs text-steel-500">
              Plain text. Blank lines separate paragraphs.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="type" className={labelCls}>
                Type
              </label>
              <select id="type" name="type" defaultValue={values.type} className={field}>
                <option value="NEWS">News</option>
                <option value="BLOG">Article</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="author" className={labelCls}>
                Author
              </label>
              <input id="author" name="author" defaultValue={values.author} className={field} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tagList" className={labelCls}>
                Tags
              </label>
              <input
                id="tagList"
                name="tagList"
                defaultValue={values.tags.join(", ")}
                className={field}
                placeholder="offshore, inspection"
              />
              <p className="text-xs text-steel-500">Comma separated.</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-brand-900">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={values.isFeatured}
                className="h-4 w-4"
              />
              Featured
            </label>
          </div>

          <MediaPicker
            name="heroImageId"
            label="Hero image"
            media={media}
            defaultValue={values.heroImageId}
          />

          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <p className={labelCls}>Search engine listing</p>
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
                placeholder="Defaults to the excerpt."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/news"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
