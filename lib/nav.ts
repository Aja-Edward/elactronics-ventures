import type { NavItem } from "@/components/site/MainNav";

import { getPublishedDivisions } from "./divisions";

/**
 * Primary navigation.
 *
 * Mirrors the reference site's menu, including its shape: each About child is
 * a standalone page under /about, as it is on the reference site, rather than
 * an anchor into one long page. Every entry points at a route that exists.
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
        { label: "Our Governance", href: "/about/governance" },
        { label: "Our History", href: "/about/history" },
        { label: "Group Entities", href: "/about/group-entities" },
        { label: "Global Locations", href: "/about/locations" },
        { label: "Awards & Recognitions", href: "/about/awards" },
        { label: "Our Certifications", href: "/certifications" },
        { label: "Clients", href: "/about/clients" },
        { label: "FAQs", href: "/about/faqs" },
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
