import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Optimistic auth check. Renamed from Middleware in Next.js 16.
 *
 * This ONLY checks whether a session cookie is present — it does not validate
 * it. Next's own documentation is explicit that Proxy "should not be used as
 * a full session management or authorization solution", and it runs before
 * the database is reachable in the request lifecycle anyway.
 *
 * The real gate is app/admin/(dashboard)/layout.tsx, which loads the session
 * from Postgres and checks the account is still active. This just saves a
 * pointless render for the common signed-out case.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page must stay reachable while signed out, or this redirect
  // loops onto itself.
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Preserve where they were heading so login can return them there later.
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything under /admin; the login path is let through inside proxy()
  // above rather than via a matcher negation, which is easier to read.
  matcher: ["/admin/:path*"],
};
