import type { NavItem } from "@/components/site/MainNav";

import { getPublishedDivisions } from "./divisions";
import { getSkidPackageServices } from "./services";

/**
 * Primary navigation.
 *
 * Mirrors the reference site's menu item for item, top level and dropdowns
 * alike: Home, About Us, Division, Skid Package Equipment, References, OEM,
 * Our Equipment, News, Contact Us. The labels are the reference's own wording,
 * so the two menus can be read side by side. The one deliberate addition is
 * Our Projects, marked below.
 *
 * Each About child is a standalone page under /about, as it is on the
 * reference site, rather than an anchor into one long page. Every entry points
 * at a route that exists.
 *
 * Divisions and the skid-package systems are read from the database rather
 * than hard-coded, so publishing or unpublishing one updates the menu with no
 * code change.
 */
export async function getNavItems(): Promise<NavItem[]> {
  const [divisions, skidServices] = await Promise.all([
    getPublishedDivisions(),
    getSkidPackageServices(),
  ]);

  return [
    { label: "Home", href: "/" },
    {
      label: "About Us",
      href: "/about",
      children: [
        { label: "Who We Are", href: "/about" },
        { label: "Our Governance", href: "/about/governance" },
        { label: "Our History", href: "/about/history" },
        { label: "Group Entities", href: "/about/group-entities" },
        { label: "Global Locations", href: "/about/locations" },
        { label: "Awards & Recognitions", href: "/about/awards" },
        { label: "Our Certifications", href: "/certifications" },
        { label: "Our News", href: "/news" },
        { label: "Our Blog", href: "/blog" },
        { label: "Events Gallery", href: "/gallery" },
        { label: "Clients", href: "/about/clients" },
        // Not on the reference site, which has no project pages at all. It
        // sits next to Clients because the two answer the same question — who
        // we have worked for, and what we did for them.
        { label: "Our Projects", href: "/projects" },
        { label: "FAQs", href: "/about/faqs" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      label: "Division",
      href: "/divisions",
      children: divisions.map((d: (typeof divisions)[number]) => ({
        label: d.title,
        href: `/divisions/${d.slug}`,
      })),
    },
    {
      label: "Skid Package Equipment",
      href: "/skid-package-equipment",
      children: skidServices.map((s: (typeof skidServices)[number]) => ({
        label: s.title,
        href: `/skid-package-equipment/${s.slug}`,
      })),
    },
    // The reference site points "References" at its clients page — the client
    // list is the reference list. Project case studies live under /projects
    // and are reached from the footer and from each division.
    { label: "References", href: "/about/clients" },
    { label: "OEM", href: "/oem" },
    { label: "Our Equipment", href: "/equipment" },
    { label: "News", href: "/news" },
    {
      label: "Contact Us",
      href: "/contact",
      children: [
        { label: "Request Quote", href: "/request-quote" },
        { label: "Become our Partner", href: "/become-our-partner" },
        { label: "Contact Details", href: "/contact" },
      ],
    },
  ];
}
