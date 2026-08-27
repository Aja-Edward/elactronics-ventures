"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveProject, type SaveState } from "./actions";
import MediaPicker, { type MediaOption } from "@/components/admin/MediaPicker";

export type ProjectValues = {
  id: string | null;
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  location: string;
  year: string;
  scope: string;
  divisionId: string | null;
  challenge: string;
  solution: string;
  results: string;
  heroImageId: string | null;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  order: number;
};

export type DivisionOption = { id: string; title: string };

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

const NARRATIVE = [
  ["challenge", "Challenge", "What the client needed solving."],
  ["solution", "Solution", "What was delivered, and how."],
  ["results", "Results", "Measurable outcome where possible."],
] as const;

export default function ProjectForm({
  values,
  media,
  divisions,
}: {
  values: ProjectValues;
  media: MediaOption[];
  divisions: DivisionOption[];
}) {
  const save = saveProject.bind(null, values.id);
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

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
          <div className="space-y-1.5">
            <label htmlFor="title" className={labelCls}>
              Project title
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
              /projects/{slug || "…"}
              {slugLocked && " — renaming creates a 301 automatically."}
            </p>
            {err("slug") && <p className="text-xs text-accent-700">{err("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="scope" className={labelCls}>
              Scope
            </label>
            <textarea
              id="scope"
              name="scope"
              defaultValue={values.scope}
              rows={2}
              maxLength={400}
              className={field}
              placeholder="One line summarising what was delivered."
            />
          </div>

          {/* Challenge / solution / results is the standard case-study shape and
              reads far better to a tender reviewer than one block of prose. */}
          {NARRATIVE.map(([nameAttr, label, placeholder]) => (
            <div key={nameAttr} className="space-y-1.5">
              <label htmlFor={nameAttr} className={labelCls}>
                {label}
              </label>
              <textarea
                id={nameAttr}
                name={nameAttr}
                rows={5}
                maxLength={3000}
                className={field}
                defaultValue={values[nameAttr]}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="clientName" className={labelCls}>
                Client
              </label>
              <input
                id="clientName"
                name="clientName"
                defaultValue={values.clientName}
                className={field}
              />
              <p className="text-xs text-steel-500">
                Only name a client you have permission to name.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="year" className={labelCls}>
                  Year
                </label>
                <input
                  id="year"
                  name="year"
                  inputMode="numeric"
                  defaultValue={values.year}
                  className={field}
                  placeholder="2025"
                />
                {err("year") && <p className="text-xs text-accent-700">{err("year")}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="industry" className={labelCls}>
                  Industry
                </label>
                <input
                  id="industry"
                  name="industry"
                  defaultValue={values.industry}
                  className={field}
                  placeholder="Oil and Gas"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className={labelCls}>
                Location
              </label>
              <input
                id="location"
                name="location"
                defaultValue={values.location}
                className={field}
                placeholder="Lagos, Nigeria"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="divisionId" className={labelCls}>
                Division
              </label>
              <select
                id="divisionId"
                name="divisionId"
                defaultValue={values.divisionId ?? ""}
                className={field}
              >
                <option value="">— none —</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-steel-500">
                Also listed on that division&rsquo;s page.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="order" className={labelCls}>
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
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-brand-900">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={values.isFeatured}
                  className="h-4 w-4"
                />
                Featured
              </label>
            </div>
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
              <label
                htmlFor="seoDescription"
                className="block text-xs font-medium text-steel-600"
              >
                SEO description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={values.seoDescription}
                rows={3}
                maxLength={180}
                className={field}
                placeholder="Defaults to the scope."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/projects"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
