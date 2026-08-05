import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStrapiClient } from "@/lib/strapi";
import {
  extractPreviewSecret,
  safeRedirectPath,
  secretsMatch,
} from "@/lib/strapi-secrets";

export const dynamic = "force-dynamic";

/**
 * Enable Next.js Draft Mode for Strapi preview.
 * GET /api/preview?secret=...&path=/services
 * Secret may also be sent as `x-strapi-preview-secret` or `Authorization: Bearer ...`.
 */
export async function GET(request: NextRequest) {
  const secret = extractPreviewSecret(request.nextUrl.searchParams, request.headers);
  const expected = process.env.STRAPI_PREVIEW_SECRET?.trim();

  const client = getStrapiClient();
  const valid = client
    ? client.verifyPreviewSecret(secret)
    : secretsMatch(expected, secret);

  if (!valid) {
    return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const target = safeRedirectPath(request.nextUrl.searchParams.get("path"));
  redirect(target);
}
