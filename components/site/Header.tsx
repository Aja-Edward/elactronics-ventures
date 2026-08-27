import Image from "next/image";
import Link from "next/link";

import LanguageSelect from "./LanguageSelect";
import MainNav from "./MainNav";
import { getPublishedCertifications } from "@/lib/certifications";
import { getNavItems } from "@/lib/nav";
import { getSiteSettings, whatsappHref } from "@/lib/site";

export default async function Header() {
  const [site, certifications, navItems] = await Promise.all([
    getSiteSettings(),
    getPublishedCertifications(),
    getNavItems(),
  ]);
  const wa = whatsappHref(site.whatsapp);

  // Accreditation marks sit in the masthead rather than at the foot of the
  // page: in this sector they are the single strongest trust signal, and a
  // buyer checking whether a contractor is certified should not have to hunt.
  const certBadges = certifications.filter((c) => c.file && !c.lapsed).slice(0, 4);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar — contact details that would otherwise be buried in the
          footer. For B2B enquiries these are the highest-intent links here. */}
      <div className="hidden bg-brand-950 text-brand-200 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-2 text-xs">
          <div className="flex items-center gap-5">
            <LanguageSelect />
            {site.phone && (
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {site.phone}
              </a>
            )}
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-white"
              >
                {site.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-5">
            {site.workingHours && <span>{site.workingHours}</span>}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white transition-opacity hover:opacity-80"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={site.logoUrl}
              alt=""
              width={503}
              height={496}
              priority
              className="h-14 w-14 shrink-0 object-contain"
            />
            {/* The mark reads "EPL" while the company trades as Elatronics
                Ventures, so the wordmark carries the identity - and keeps it
                legible where the globe reduces to a smudge. */}
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight text-brand-900">
                {site.companyName}
              </span>
              {site.tagline && (
                <span className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-steel-600 sm:block">
                  {site.tagline}
                </span>
              )}
            </span>
          </Link>

          {/* Accreditation marks, masthead-right. Hidden below lg so they never
              squeeze the wordmark on a phone — they reappear under the nav. */}
          {/* Sized to the reference: the composite ISO banner renders 370x88
              there, roughly 2.5x the logo's width. These are 859x204 source
              images (~4.2:1), so the box keeps that ratio and object-contain
              handles any badge supplied at a different shape. */}
          {certBadges.length > 0 && (
            <Link
              href="/certifications"
              aria-label="View our certifications"
              className="hidden items-center gap-6 lg:flex"
            >
              {certBadges.map((cert) => (
                <span
                  key={cert.id}
                  className="relative h-[72px] w-[300px] shrink-0 xl:h-[88px] xl:w-[370px]"
                >
                  <Image
                    src={cert.file!.secureUrl}
                    alt={cert.file!.alt || cert.name}
                    fill
                    sizes="(min-width: 1280px) 370px, 300px"
                    className="object-contain"
                  />
                </span>
              ))}
            </Link>
          )}

          {/* Plain GET form — works with JavaScript disabled, and the query
              lands in the URL so results are linkable. */}
          <form
            action="/search"
            method="get"
            role="search"
            className="hidden shrink-0 items-center md:flex"
          >
            <label htmlFor="header-search" className="sr-only">
              Search this site
            </label>
            <input
              id="header-search"
              type="search"
              name="q"
              placeholder="Search..."
              className="w-40 rounded-l border border-r-0 border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none placeholder:text-steel-400 focus:border-brand-900 lg:w-48"
            />
            <button
              type="submit"
              className="rounded-r bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Search
            </button>
          </form>

          <Link
            href="/request-quote"
            className="shrink-0 rounded bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700 md:hidden"
          >
            Quote
          </Link>
        </div>
      </div>

      {/* Primary navigation, on its own band beneath the masthead. The nav
          itself is a Client Component because the dropdowns need state; the
          items are resolved on the server so divisions come from the database. */}
      <div className="relative border-b border-brand-100 bg-white">
        <MainNav items={navItems} />
      </div>

      {/* Small screens: the badges the masthead could not fit. */}
      {certBadges.length > 0 && (
        <div className="border-b border-brand-100 bg-surface lg:hidden">
          <Link
            href="/certifications"
            aria-label="View our certifications"
            className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-6 py-2"
          >
            {certBadges.map((cert) => (
              <span key={cert.id} className="relative h-12 w-[190px] shrink-0">
                <Image
                  src={cert.file!.secureUrl}
                  alt={cert.file!.alt || cert.name}
                  fill
                  sizes="190px"
                  className="object-contain"
                />
              </span>
            ))}
          </Link>
        </div>
      )}
    </header>
  );
}
