import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import {
  extractPreviewSecret,
  safeRedirectPath,
  secretsMatch,
} from "@/lib/strapi-secrets";

export const dynamic = "force-dynamic";

/**
 * Enable Next.js Draft Mode for Strapi preview (site key: personal).
 * GET /api/preview?secret=...&path=/blog/my-slug
 */
export async function GET(request: NextRequest) {
  const secret = extractPreviewSecret(request.nextUrl.searchParams, request.headers);
  const expected = process.env.STRAPI_PREVIEW_SECRET?.trim();

  if (!secretsMatch(expected, secret)) {
    return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const target = safeRedirectPath(request.nextUrl.searchParams.get("path"));
  redirect(target);
}
