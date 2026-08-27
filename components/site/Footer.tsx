import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { tags } from "@/lib/cache-tags";
import { getSiteSettings, SITE_NAV, whatsappHref } from "@/lib/site";

export default async function Footer() {
  // Cached as a unit. This also resolves the copyright year: `new Date()` is
  // an unstable value that Next refuses to prerender, since it can differ
  // between renders. Inside a cache scope it is computed once and refreshed
  // with the entry, so the year rolls over within a day of 1 January.
  "use cache";
  cacheTag(tags.siteSettings());
  cacheLife("days");

  const site = await getSiteSettings();
  const wa = whatsappHref(site.whatsapp);
  const year = new Date().getFullYear();

  const address = [site.addressLine, site.city, site.state, site.country]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="mt-auto bg-brand-950 text-brand-200">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              {/* The mark is a full-colour PNG with no white variant, so it
                  sits on a light chip here rather than being knocked out.
                  Replace with an SVG once the client supplies vector. */}
              <span className="flex h-11 w-11 items-center justify-center rounded bg-white p-1">
                <Image
                  src={site.logoUrl}
                  alt=""
                  width={503}
                  height={496}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="font-display text-lg font-bold text-white">
                {site.companyName}
              </span>
            </div>
            {site.tagline && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-300">
                {site.tagline}
              </p>
            )}
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-steel-400">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-brand-200 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-steel-400">
              Get in touch
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {address && (
                <li className="max-w-xs leading-relaxed text-brand-300">
                  {address}
                </li>
              )}
              {site.email && (
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="break-words transition-colors hover:text-white"
                  >
                    {site.email}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {site.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    WhatsApp {site.whatsapp}
                  </a>
                </li>
              )}
              {site.workingHours && (
                <li className="text-brand-300">{site.workingHours}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-900 pt-6 text-xs text-steel-400">
          © {year} {site.companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
