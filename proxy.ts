import { NextResponse, type NextRequest } from "next/server";
import { getCategory } from "@/lib/data";

/**
 * With Cache Components a page's `notFound()` for a slug that was not
 * prerendered runs after the shell is sent, so the response keeps status 200
 * (with a noindex tag). Checking the slug here, before streaming starts,
 * returns a real 404. Add a branch per dynamic route that needs it.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = /^\/categories\/([^/]+)\/?$/.exec(pathname);
  if (match) {
    let slug = match[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      // A malformed escape is never a real slug.
    }
    if (!(await getCategory(slug))) {
      return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/categories/:slug"],
};
