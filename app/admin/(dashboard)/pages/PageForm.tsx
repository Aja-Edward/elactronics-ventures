"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { savePage, ROUTED_SLUGS, type SaveState } from "./actions";

export type PageValues = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
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

export default function PageForm({ values }: { values: PageValues }) {
  const save = savePage.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});
  const err = (k: string) => state.fieldErrors?.[k];
  const creating = !values.id;

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
              Page title
            </label>
            <input id="title" name="title" defaultValue={values.title} required className={field} />
            {err("title") && <p className="text-xs text-accent-700">{err("title")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className={labelCls}>
              Slug
            </label>
            {creating ? (
              <select
                id="slug"
                name="slug"
                defaultValue={values.slug || ROUTED_SLUGS[0]}
                className={field}
              >
                {ROUTED_SLUGS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="slug"
                name="slug"
                defaultValue={values.slug}
                readOnly
                className={`${field} bg-surface font-mono text-steel-600`}
              />
            )}
            <p className="text-xs text-steel-500">
              {creating
                ? "Only slugs with a matching route can be created — otherwise the content would be unreachable."
                : "Fixed after creation, so the public URL cannot break."}
            </p>
            {err("slug") && <p className="text-xs text-accent-700">{err("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className={labelCls}>
              Standfirst
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={values.description}
              rows={2}
              maxLength={300}
              className={field}
              placeholder="One line under the page heading."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body" className={labelCls}>
              Body
            </label>
            <textarea
              id="body"
              name="body"
              defaultValue={values.body}
              rows={18}
              maxLength={30000}
              className={field}
              placeholder="Leave a blank line between paragraphs."
            />
            <p className="text-xs text-steel-500">
              Plain text. Blank lines separate paragraphs.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-100 bg-surface p-5 text-xs leading-relaxed text-steel-700">
            <p className="font-semibold text-brand-900">About this page</p>
            <p className="mt-2">
              The About page also pulls in leadership, history, group entities
              and awards from their own admin screens. Each of those sections
              only appears once something is published there.
            </p>
          </div>

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
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/pages"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
