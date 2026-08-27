/**
 * Cache tags, in one place.
 *
 * Every cached read tags itself with one of these; every publish/unpublish
 * invalidates the matching tag. Keeping them as functions rather than loose
 * string literals means a rename is a compile error rather than a page that
 * silently never refreshes — which is the failure mode that makes CMS caching
 * bugs so hard to spot.
 *
 * Use `updateTag` in Server Actions so an editor sees their own change
 * immediately; use `revalidateTag` from webhooks or Route Handlers where
 * stale-while-revalidate is acceptable.
 */

export const tags = {
  siteSettings: () => "site-settings",

  heroSlides: () => "hero-slides",

  divisions: () => "divisions",
  division: (slug: string) => `division:${slug}`,

  services: () => "services",
  service: (slug: string) => `service:${slug}`,

  equipment: () => "equipment",
  equipmentItem: (slug: string) => `equipment:${slug}`,

  projects: () => "projects",
  project: (slug: string) => `project:${slug}`,

  posts: () => "posts",
  post: (slug: string) => `post:${slug}`,

  pages: () => "pages",
  page: (slug: string) => `page:${slug}`,

  redirects: () => "redirects",

  clients: () => "clients",
  oemPartners: () => "oem-partners",
  certifications: () => "certifications",
  awards: () => "awards",
  groupEntities: () => "group-entities",
  locations: () => "locations",
  team: () => "team",
  history: () => "history",
  gallery: () => "gallery",
  faqs: () => "faqs",
} as const;
