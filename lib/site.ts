import { cacheLife, cacheTag } from "next/cache";

import { db } from "./db";
import { tags } from "./cache-tags";

/**
 * Company details, read from the SiteSetting singleton.
 *
 * FALLBACK holds the details supplied by the client, so every page renders
 * correctly before the row is seeded and keeps rendering if the database is
 * briefly unreachable. Once seeded, the database wins field by field - a blank
 * value in the CMS falls back rather than rendering an empty string.
 */

export type SiteSettings = {
  companyName: string;
  tagline: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  workingHours: string | null;
  logoUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

const FALLBACK: SiteSettings = {
  companyName: "Elatronics Ventures",
  tagline: "Integrated engineering and industrial services",
  addressLine: "Royal Garden Estate, Off Lakowe Lake Resort Road",
  city: "Lakowe, Ibeju-Lekki",
  state: "Lagos State",
  country: "Nigeria",
  email: "sadohgani@yahoo.com",
  phone: "+234 803 282 9403",
  whatsapp: "+234 903 022 8288",
  workingHours: "Mon – Fri, 9am to 5pm",
  logoUrl: "/brand/images/Elatronics_Ventures-logo.png",
  defaultSeoTitle: "Elatronics Ventures | Engineering & Industrial Services",
  defaultSeoDescription:
    "Integrated engineering, construction, maintenance and inspection services for the energy and industrial sectors in Nigeria.",
};

/** Empty strings from the CMS are treated as "not set" and fall back. */
function preferred<T>(value: T | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return value;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(tags.siteSettings());
  // Settings change rarely and appear in the header and footer of every page,
  // so a long life is worth it — saving the admin's edit invalidates the tag,
  // so nobody waits for it to expire.
  cacheLife("days");

  try {
    const row = await db.siteSetting.findUnique({
      where: { id: 1 },
      include: { logo: true },
    });

    if (!row) return FALLBACK;

    return {
      companyName: preferred(row.companyName, FALLBACK.companyName),
      tagline: preferred(row.tagline, FALLBACK.tagline),
      addressLine: preferred(row.addressLine, FALLBACK.addressLine),
      city: preferred(row.city, FALLBACK.city),
      state: preferred(row.state, FALLBACK.state),
      country: preferred(row.country, FALLBACK.country),
      email: preferred(row.email, FALLBACK.email),
      phone: preferred(row.phone, FALLBACK.phone),
      whatsapp: preferred(row.whatsapp, FALLBACK.whatsapp),
      workingHours: preferred(row.workingHours, FALLBACK.workingHours),
      logoUrl: preferred(row.logo?.secureUrl, FALLBACK.logoUrl),
      defaultSeoTitle: preferred(row.defaultSeoTitle, FALLBACK.defaultSeoTitle),
      defaultSeoDescription: preferred(
        row.defaultSeoDescription,
        FALLBACK.defaultSeoDescription,
      ),
    };
  } catch {
    // The public site must not 500 because the database is unreachable.
    // Note this fallback does get cached, so an outage during a cache miss
    // can persist until the tag is invalidated or cacheLife expires.
    return FALLBACK;
  }
}

/** Digits only, for a wa.me deep link. */
export function whatsappHref(number: string | null): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export const SITE_NAV = [
  { label: "About", href: "/about" },
  { label: "Divisions", href: "/divisions" },
  { label: "Equipment", href: "/equipment" },
  { label: "Projects", href: "/projects" },
  { label: "Certifications", href: "/certifications" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;
