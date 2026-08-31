"use client";

import { useActionState } from "react";

import { submitPartnerApplication, type PartnerState } from "./actions";
import {
  BotTraps,
  Field,
  SubmitButton,
  fieldCls,
} from "@/components/site/FormFields";

/** The kinds of approach we actually get, so enquiries arrive pre-sorted. */
const PARTNER_TYPES = [
  "Original equipment manufacturer (OEM)",
  "Distributor or reseller",
  "Subcontractor",
  "Joint venture / consortium",
  "Technology or licensing partner",
  "Other",
];

export default function PartnerForm() {
  const [state, formAction] = useActionState<PartnerState, FormData>(
    submitPartnerApplication,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-lg border border-brand-200 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-bold text-brand-900">
          Application received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-700">
          Thank you — our commercial team will review your details and reply to
          the email address you gave us.
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
        <Field name="companyName" label="Company" required error={err("companyName")}>
          <input
            id="companyName"
            name="companyName"
            required
            autoComplete="organization"
            className={fieldCls}
          />
        </Field>
        <Field name="contactName" label="Your name" required error={err("contactName")}>
          <input
            id="contactName"
            name="contactName"
            required
            autoComplete="name"
            className={fieldCls}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" label="Email" required error={err("email")}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldCls}
          />
        </Field>
        <Field name="phone" label="Phone" error={err("phone")}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="country" label="Country" error={err("country")}>
          <input
            id="country"
            name="country"
            autoComplete="country-name"
            className={fieldCls}
          />
        </Field>
        <Field name="partnerType" label="Partnership type" error={err("partnerType")}>
          <select id="partnerType" name="partnerType" className={fieldCls} defaultValue="">
            <option value="">— select —</option>
            {PARTNER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        name="message"
        label="About your company"
        required
        error={err("message")}
        hint="What you manufacture or supply, the markets you cover, and what you are looking for from us."
      >
        <textarea id="message" name="message" rows={6} required className={fieldCls} />
      </Field>

      <SubmitButton label="Submit application" pendingLabel="Sending…" />
    </form>
  );
}
