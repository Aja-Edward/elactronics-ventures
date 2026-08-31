/**
 * `Service.group` values, in one place.
 *
 * Kept out of lib/services.ts for the same reason form-constants.ts is kept
 * out of lib/forms.ts: that module imports next/cache and Prisma, and the seed
 * script needs the constant without dragging either in.
 */
export const SKID_GROUP = "skid-package";
