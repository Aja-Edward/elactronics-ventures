"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveEquipment, type SaveState } from "./actions";
import MediaPicker, { type MediaOption } from "@/components/admin/MediaPicker";

export type EquipmentValues = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  category: string;
  quantity: string;
  imageId: string | null;
  specs: { label: string; value: string }[];
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

function slugify(v: string) {
  return v.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function EquipmentForm({
  values,
  media,
}: {
  values: EquipmentValues;
  media: MediaOption[];
}) {
  const save = saveEquipment.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [slugLocked] = useState(Boolean(values.id));

  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p role="alert" className="rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Equipment name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugLocked) setSlug(slugify(e.target.value));
              }}
              required
              className={field}
              placeholder="e.g. High Pressure Hydro Jetting Machine"
            />
            {err("name") && <p className="text-xs text-accent-700">{err("name")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Slug
            </label>
            <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className={`${field} font-mono`} />
            {err("slug") && <p className="text-xs text-accent-700">{err("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={values.description}
              rows={6}
              maxLength={1500}
              className={field}
              placeholder="What the unit is used for."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="specs" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Specifications
            </label>
            <textarea
              id="specs"
              name="specs"
              defaultValue={values.specs.map((s) => `${s.label}: ${s.value}`).join("\n")}
              rows={6}
              className={`${field} font-mono`}
              placeholder={"One per line, Label: value\n\nPressure: 40,000 psi\nFlow rate: 25 lpm\nDrive: Diesel"}
            />
            <p className="text-xs text-steel-500">
              One per line as <code>Label: value</code>. Rendered as a table.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Category
              </label>
              <input
                id="category"
                name="category"
                defaultValue={values.category}
                className={field}
                placeholder="e.g. Cleaning, Lifting, Testing"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quantity" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Units owned
              </label>
              <input id="quantity" name="quantity" inputMode="numeric" defaultValue={values.quantity} className={field} placeholder="e.g. 2" />
              {err("quantity") && <p className="text-xs text-accent-700">{err("quantity")}</p>}
              <p className="text-xs text-steel-500">
                Leave blank if not relevant. This is an ownership claim — only
                enter what the company actually holds.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="order" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Order
              </label>
              <input id="order" name="order" type="number" min={0} max={9999} defaultValue={values.order} className={field} />
            </div>
          </div>

          <MediaPicker name="imageId" label="Photograph" media={media} defaultValue={values.imageId} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link href="/admin/equipment" className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
