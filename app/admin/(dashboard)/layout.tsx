import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "../login/actions";
import { getCurrentUser } from "@/lib/auth";

// The admin reads cookies on every request and must never be prerendered or
// served stale, so it opts out of instant-navigation validation and blocks.
export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Hero", href: "/admin/hero" },
  { label: "Divisions", href: "/admin/divisions" },
  // One link for the seven About entities; they share a hub at /admin/about
  // rather than each claiming a slot in a header that is already full.
  { label: "About", href: "/admin/about" },
  { label: "Skid Systems", href: "/admin/skid-package-equipment" },
  { label: "Equipment", href: "/admin/equipment" },
  { label: "OEM", href: "/admin/oem" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Certifications", href: "/admin/certifications" },
  { label: "News", href: "/admin/news" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Pages", href: "/admin/pages" },
  { label: "Media", href: "/admin/media" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();

  // The real authorization gate. proxy.ts does an optimistic cookie check to
  // avoid a wasted render, but Next's own docs are explicit that Proxy must
  // not be the authorization boundary — that belongs here, next to the data.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="font-display text-base font-bold text-brand-900"
            >
              Elatronics CMS
            </Link>
            {/* Wraps rather than overflowing: the list has grown past what
                one row holds at md, and a nav that scrolls sideways is a nav
                whose last few items are never found. */}
            <nav className="hidden flex-wrap items-center gap-x-5 gap-y-1 md:flex">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-steel-700 transition-colors hover:text-brand-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-semibold text-brand-900">
                {user.name}
              </span>
              <span className="block text-steel-600">
                {user.role.replace("_", " ").toLowerCase()}
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
