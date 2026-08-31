/**
 * The pieces of the admin CRUD contract that both sides of the network need.
 *
 * Kept apart from `crud.ts` deliberately: that module reaches for the database,
 * the session cookie and Next's cache APIs, so a "use client" form importing
 * anything from it drags Prisma and `next/headers` into the browser bundle and
 * the build fails. This file must stay free of server-only imports.
 */

export type SaveState = { error?: string; fieldErrors?: Record<string, string> };

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The same transform, but safe to run on every keystroke.
 *
 * `slugify` strips trailing hyphens, which makes a hyphenated slug impossible
 * to type by hand: the moment you press "-", it is removed, and the next
 * character joins the previous word. So while the field has focus a trailing
 * hyphen is kept, and `slugify` is applied on blur to tidy it up.
 */
export function slugifyWhileTyping(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");
}
