import { NextResponse, type NextRequest } from "next/server";
import { isKnownPath } from "@/lib/route-guards";

/**
 * Real 404s for unknown slugs on dynamic routes; see `lib/route-guards.ts`
 * for why and for how to add a route (R12).
 */
export function proxy(request: NextRequest) {
  const known = isKnownPath(request.nextUrl.pathname);
  if (known === false) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

// Must be a static literal. One entry per guard in lib/route-guards.ts.
export const config = {
  matcher: ["/categories/:slug"],
};
