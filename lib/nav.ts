import type { NavItem } from "@/components/site/MainNav";

import { getPublishedDivisions } from "./divisions";

/**
 * Primary navigation.
 *
 * Mirrors the reference site's menu, with one deliberate difference: every
 * entry points at something that actually exists. Several of their About
 * children are standalone pages; here those are sections of /about, linked by
 * anchor. A menu full of 404s is worse than a shorter menu.
 *
 * Divisions are read from the database rather than hard-coded, so publishing
 * or unpublishing one updates the menu with no code change.
 */
export async function getNavItems(): Promise<NavItem[]> {
  const divisions = await getPublishedDivisions();

  return [
    { label: "Home", href: "/" },
    {
      label: "About Us",
      href: "/about",
      children: [
        { label: "Who We Are", href: "/about" },
        { label: "Our Governance", href: "/about#governance" },
        { label: "Our History", href: "/about#history" },
        { label: "Group Entities", href: "/about#group-entities" },
        { label: "Global Locations", href: "/about#locations" },
        { label: "Awards & Recognitions", href: "/about#awards" },
        { label: "Our Certifications", href: "/certifications" },
        { label: "Clients", href: "/about#clients" },
        { label: "FAQs", href: "/about#faq" },
        { label: "News", href: "/news" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      label: "Divisions",
      href: "/divisions",
      children: divisions.map((d: (typeof divisions)[number]) => ({
        label: d.title,
        href: `/divisions/${d.slug}`,
      })),
    },
    { label: "Equipment", href: "/equipment" },
    { label: "Projects", href: "/projects" },
    { label: "News", href: "/news" },
    {
      label: "Contact Us",
      href: "/contact",
      children: [
        { label: "Contact Details", href: "/contact" },
        { label: "Request a Quote", href: "/request-quote" },
      ],
    },
  ];
}
