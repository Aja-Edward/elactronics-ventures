"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveSlide, type SaveState } from "./actions";
import MediaPicker, { type MediaOption } from "@/components/admin/MediaPicker";

export type SlideValues = {
  id: string | null;
  title: string;
  subtitle: string;
  imageId: string | null;
  ctaLabel: string;
  ctaHref: string;
  ctaAltLabel: string;
  ctaAltHref: string;
  order: number;
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

export default function SlideForm({
  values,
  media,
}: {
  values: SlideValues;
  media: MediaOption[];
}) {
  const save = saveSlide.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});
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
              Headline
            </label>
            <textarea
              id="title"
              name="title"
              defaultValue={values.title}
              rows={2}
              maxLength={140}
              required
              className={field}
              placeholder="e.g. Safety is our core business value"
            />
            {err("title") && <p className="text-xs text-accent-700">{err("title")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subtitle" className={labelCls}>
              Supporting line
            </label>
            <textarea
              id="subtitle"
              name="subtitle"
              defaultValue={values.subtitle}
              rows={3}
              maxLength={300}
              className={field}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ctaLabel" className={labelCls}>
                Button label
              </label>
              <input id="ctaLabel" name="ctaLabel" defaultValue={values.ctaLabel} className={field} placeholder="Request a Quote" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ctaHref" className={labelCls}>
                Button link
              </label>
              <input id="ctaHref" name="ctaHref" defaultValue={values.ctaHref} className={`${field} font-mono`} placeholder="/request-quote" />
              {err("ctaHref") && <p className="text-xs text-accent-700">{err("ctaHref")}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ctaAltLabel" className={labelCls}>
                Second button label
              </label>
              <input id="ctaAltLabel" name="ctaAltLabel" defaultValue={values.ctaAltLabel} className={field} placeholder="Our Divisions" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ctaAltHref" className={labelCls}>
                Second button link
              </label>
              <input id="ctaAltHref" name="ctaAltHref" defaultValue={values.ctaAltHref} className={`${field} font-mono`} placeholder="/divisions" />
              {err("ctaAltHref") && <p className="text-xs text-accent-700">{err("ctaAltHref")}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="order" className={labelCls}>
                Order
              </label>
              <input id="order" name="order" type="number" min={0} max={999} defaultValue={values.order} className={field} />
              <p className="text-xs text-steel-500">Lower numbers show first.</p>
            </div>
          </div>

          <MediaPicker name="imageId" label="Background image" media={media} defaultValue={values.imageId} />

          <p className="rounded-lg border border-brand-100 bg-surface p-4 text-xs leading-relaxed text-steel-600">
            Use a wide, landscape photograph. The headline sits over the left of
            the image, so avoid pictures with important detail on that side.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/hero"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
