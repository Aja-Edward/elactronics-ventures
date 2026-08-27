"use client";

import { useActionState } from "react";

import { submitContact, type ContactState } from "./actions";
import {
  BotTraps,
  Field,
  SubmitButton,
  fieldCls,
} from "@/components/site/FormFields";

export default function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-lg border border-brand-200 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-bold text-brand-900">
          Message sent
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-700">
          Thank you — we have your message and will reply to the email address
          you gave us.
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
        <Field name="name" label="Your name" required error={err("name")}>
          <input id="name" name="name" required autoComplete="name" className={fieldCls} />
        </Field>
        <Field name="email" label="Email" required error={err("email")}>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Phone" error={err("phone")}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
        </Field>
        <Field name="subject" label="Subject" error={err("subject")}>
          <input id="subject" name="subject" className={fieldCls} />
        </Field>
      </div>

      <Field name="message" label="Message" required error={err("message")}>
        <textarea id="message" name="message" rows={6} required className={fieldCls} />
      </Field>

      <SubmitButton label="Send message" pendingLabel="Sending…" />
    </form>
  );
}
