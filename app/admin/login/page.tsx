import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import LoginForm from "./LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";

// The admin reads cookies on every request and must never be prerendered or
// served stale, so it opts out of instant-navigation validation and blocks.
export const instant = false;

export const metadata: Metadata = {
  title: "Sign in",
  // Keep the admin out of search results entirely.
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already signed in? Skip the form.
  if (await getCurrentUser()) redirect("/admin");

  const site = await getSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src={site.logoUrl}
            alt=""
            width={503}
            height={496}
            priority
            className="h-11 w-11 object-contain"
          />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-brand-900">
              {site.companyName}
            </p>
            <p className="text-xs font-medium tracking-wide text-steel-600">
              Content management
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-brand-100 bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            Authorised staff only.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
