import { type NextRequest, NextResponse } from "next/server";

/** Allow Strapi admin to embed Atlas pages in the preview iframe. */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const ancestors = ["'self'"];

  const strapiUrl =
    process.env.STRAPI_URL?.trim() || process.env.STRAPI_API_URL?.trim();
  if (strapiUrl) {
    try {
      ancestors.push(new URL(strapiUrl).origin);
    } catch {
      // ignore invalid STRAPI_URL
    }
  }

  if (process.env.NODE_ENV === "development") {
    ancestors.push("http://localhost:1337");
  }

  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${ancestors.join(" ")}`,
  );
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
