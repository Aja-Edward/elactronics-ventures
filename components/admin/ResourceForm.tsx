"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import MediaPicker, { type MediaOption } from "./MediaPicker";
import { slugify, slugifyWhileTyping, type SaveState } from "@/lib/admin/form";

/**
 * Form for a simple admin record, built from a field list.
 *
 * The seven About entities are all the same shape — a few text fields, an
 * order, sometimes an image — and hand-writing seven near-identical forms is
 * how they drift apart. Anything genuinely bespoke (the certification form's
 * expiry warning, the division form's category logic) still gets its own
 * component; this is for the ones that are not.
 */

export type Field =
  | {
      kind: "text" | "url" | "email" | "date";
      name: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      hint?: string;
      mono?: boolean;
      full?: boolean;
    }
  | {
      kind: "textarea";
      name: string;
      label: string;
      rows?: number;
      maxLength?: number;
      required?: boolean;
      placeholder?: string;
      hint?: string;
      full?: boolean;
    }
  | {
      kind: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      required?: boolean;
      hint?: string;
      full?: boolean;
    }
  | { kind: "checkbox"; name: string; label: string; hint?: string; full?: boolean };

export type FieldValues = Record<string, string | number | boolean | null>;

const input =
  "w-full rounded border border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/15";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-steel-600";

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

export default function ResourceForm({
  action,
  values,
  fields,
  sideFields = [],
  media,
  slug,
  extra,
  cancelHref,
}: {
  action: (prev: SaveState, formData: FormData) => Promise<SaveState>;
  values: FieldValues;
  fields: Field[];
  sideFields?: Field[];
  media?: { name: string; label: string; options: MediaOption[] };
  /** Derives a URL slug from another field until the slug is edited by hand. */
  slug?: { source: string; name: string };
  /**
   * A bespoke control posted with the rest of the form — the gallery's image
   * picker, for one. It sits full width below the field grid, because the
   * things that need it are wider than the side column.
   */
  extra?: ReactNode;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState<SaveState, FormData>(action, {});

  const [slugValue, setSlugValue] = useState(String(values[slug?.name ?? ""] ?? ""));
  // Once an editor types their own slug, stop overwriting it. Existing records
  // count as hand-set: changing a published URL should never be a side effect
  // of fixing a typo in the title.
  const [slugLocked, setSlugLocked] = useState(Boolean(values[slug?.name ?? ""]));

  const err = (name: string) => state.fieldErrors?.[name];

  function renderField(field: Field) {
    const error = err(field.name);
    const isSlug = slug && field.name === slug.name;
    const isSlugSource = slug && field.name === slug.source;

    if (field.kind === "checkbox") {
      return (
        <div key={field.name} className={field.full ? "sm:col-span-2" : undefined}>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              name={field.name}
              value="on"
              defaultChecked={Boolean(values[field.name])}
              className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-900 focus:ring-brand-900/25"
            />
            <span>
              <span className="block text-sm font-medium text-brand-900">
                {field.label}
              </span>
              {field.hint && (
                <span className="mt-0.5 block text-xs text-steel-500">{field.hint}</span>
              )}
            </span>
          </label>
        </div>
      );
    }

    return (
      <div
        key={field.name}
        className={`space-y-1.5 ${field.full ? "sm:col-span-2" : ""}`}
      >
        <label htmlFor={field.name} className={labelClass}>
          {field.label}
          {field.required && <span className="ml-1 text-accent-600">*</span>}
        </label>

        {field.kind === "textarea" ? (
          <textarea
            id={field.name}
            name={field.name}
            defaultValue={String(values[field.name] ?? "")}
            required={field.required}
            rows={field.rows ?? 4}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            className={input}
          />
        ) : field.kind === "number" ? (
          <input
            id={field.name}
            name={field.name}
            type="number"
            min={field.min}
            max={field.max}
            required={field.required}
            defaultValue={String(values[field.name] ?? "")}
            className={input}
          />
        ) : isSlug ? (
          <input
            id={field.name}
            name={field.name}
            value={slugValue}
            onChange={(e) => {
              setSlugLocked(true);
              setSlugValue(slugifyWhileTyping(e.target.value));
            }}
            // Tidies the trailing hyphen that typing is allowed to leave.
            onBlur={(e) => setSlugValue(slugify(e.target.value))}
            required={field.required}
            placeholder={field.placeholder}
            className={`${input} font-mono`}
          />
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.kind === "text" ? "text" : field.kind}
            defaultValue={String(values[field.name] ?? "")}
            required={field.required}
            placeholder={field.placeholder}
            onChange={
              isSlugSource
                ? (e) => {
                    if (!slugLocked) setSlugValue(slugify(e.target.value));
                  }
                : undefined
            }
            className={field.mono ? `${input} font-mono` : input}
          />
        )}

        {field.hint && !error && (
          <p className="text-xs text-steel-500">{field.hint}</p>
        )}
        {error && <p className="text-xs text-accent-700">{error}</p>}
      </div>
    );
  }

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

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 self-start rounded-lg border border-brand-100 bg-white p-5 sm:grid-cols-2">
          {fields.map(renderField)}
        </div>

        <div className="space-y-6">
          {sideFields.length > 0 && (
            <div className="grid gap-4 rounded-lg border border-brand-100 bg-white p-5">
              {sideFields.map(renderField)}
            </div>
          )}
          {media && (
            <MediaPicker
              name={media.name}
              label={media.label}
              media={media.options}
              defaultValue={String(values[media.name] ?? "")}
            />
          )}
        </div>
      </div>

      {extra}

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href={cancelHref}
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
