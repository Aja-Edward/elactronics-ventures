"use client";

import { useActionState } from "react";

import { submitQuote, type QuoteState } from "./actions";
import { BotTraps, Field, SubmitButton, fieldCls } from "@/components/site/FormFields";

const TIMELINES = [
  "",
  "Urgent — within 2 weeks",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Planning / budgetary only",
];

export default function QuoteForm({ divisions }: { divisions: string[] }) {
  const [state, formAction] = useActionState<QuoteState, FormData>(submitQuote, {});

  if (state.ok) {
    return (
      <div className="rounded-lg border border-brand-200 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-bold text-brand-900">
          Request received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-700">
          Thank you. We will review the scope and come back to you with a quote.
          If it is urgent, call us on the number in the footer.
        </p>
      </div>
    );
  }

  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={formAction} className="relative space-y-5">
      <BotTraps />

      {state.error && (
        <p
          role="alert"
          className="rounded border border-accent-200 bg-accent-50 px-3.5 py-2.5 text-sm text-accent-800"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="fullName" label="Full name" required error={err("fullName")}>
          <input id="fullName" name="fullName" required autoComplete="name" className={fieldCls} />
        </Field>
        <Field name="company" label="Company" required error={err("company")}>
          <input id="company" name="company" required autoComplete="organization" className={fieldCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" label="Email" required error={err("email")}>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldCls} />
        </Field>
        <Field name="phone" label="Phone" required error={err("phone")}>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className={fieldCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="serviceInterest" label="Service required" error={err("serviceInterest")}>
          {/* Populated from published divisions, so this list can never drift
              out of step with what the company actually offers. */}
          <select id="serviceInterest" name="serviceInterest" className={fieldCls} defaultValue="">
            <option value="">— select —</option>
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value="Other / not sure">Other / not sure</option>
          </select>
        </Field>
        <Field name="projectLocation" label="Project location" error={err("projectLocation")}>
          <input id="projectLocation" name="projectLocation" className={fieldCls} placeholder="e.g. Onne, Rivers State" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="projectType" label="Project type" error={err("projectType")}>
          <input id="projectType" name="projectType" className={fieldCls} placeholder="e.g. Shutdown maintenance" />
        </Field>
        <Field name="timeline" label="Timeline" error={err("timeline")}>
          <select id="timeline" name="timeline" className={fieldCls} defaultValue="">
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t || "— select —"}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        name="message"
        label="Scope of work"
        required
        error={err("message")}
        hint="The more detail you give — quantities, standards, access constraints — the more accurate the quote."
      >
        <textarea id="message" name="message" rows={7} required className={fieldCls} />
      </Field>

      <SubmitButton label="Submit request" pendingLabel="Submitting…" />
    </form>
  );
}
