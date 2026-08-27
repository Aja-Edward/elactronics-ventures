/**
 * Shared between the browser and the server, so this file must stay free of
 * any server-only import.
 *
 * These names previously lived in lib/forms.ts, which imports Prisma and
 * next/headers — importing them from a Client Component dragged the whole
 * server chain into the browser bundle and broke the build.
 */

export const HONEYPOT_FIELD = "company_website";
export const TIMESTAMP_FIELD = "form_loaded_at";

/** A form completed faster than this was not filled in by a person. */
export const MIN_FILL_MS = 2_000;
