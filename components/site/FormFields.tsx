"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/form-constants";

export const fieldCls =
  "w-full rounded border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/15";

export const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-steel-600";

/**
 * Bot traps, rendered into every public form.
 *
 * The honeypot is hidden from sighted users with CSS and from screen readers
 * with aria-hidden plus tabIndex -1 — using `display:none` alone would keep it
 * in the tab order for some assistive technology and confuse real people.
 */
export function BotTraps() {
  const [loadedAt, setLoadedAt] = useState("");

  // Set on the client after hydration, so a prerendered page cannot bake in a
  // stale timestamp that makes every submission look instantaneous.
  useEffect(() => setLoadedAt(String(Date.now())), []);

  return (
    <>
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Company website</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name={TIMESTAMP_FIELD} value={loadedAt} readOnly />
    </>
  );
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function Field({
  name,
  label,
  error,
  required,
  children,
  hint,
}: {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelCls}>
        {label}
        {required && <span className="ml-1 text-accent-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-steel-500">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-accent-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
