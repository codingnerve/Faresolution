import { NextResponse, type NextRequest } from "next/server";
import { canonicalPath, isKnownPath } from "@/lib/route-guards";

/**
 * Real 404s for unknown slugs on dynamic routes, and real 308s to the
 * canonical URL where a route has one (comparisons); see
 * `lib/route-guards.ts` for why and for how to add a route (R12).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const known = isKnownPath(pathname);
  if (known === false) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  const canonical = known ? canonicalPath(pathname) : null;
  if (canonical) {
    const url = request.nextUrl.clone();
    url.pathname = canonical;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Must be a static literal. Covers every path shape of every guard in
// lib/route-guards.ts (route-guards.test.ts checks this).
export const config = {
  matcher: [
    "/categories/:slug",
    "/industries/:slug",
    "/products/:slug",
    "/products/:slug/:tab",
    "/compare/:slug",
    "/alternatives/:product",
    "/reviews/write/:product",
  ],
};
