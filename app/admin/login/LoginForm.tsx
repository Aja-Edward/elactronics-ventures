"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

const field =
  "w-full rounded border border-brand-200 px-3 py-2.5 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/20";

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.error && (
        <p
          role="alert"
          className="rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wide text-steel-600"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={field}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wide text-steel-600"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
          placeholder="••••••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
