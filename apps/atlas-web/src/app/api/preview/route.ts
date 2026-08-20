import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { getAtlasStrapiClient } from "@/lib/strapi/client";
import {
  extractPreviewSecret,
  safeRedirectPath,
  secretsMatch,
} from "@/lib/strapi/secrets";

export const dynamic = "force-dynamic";

/**
 * Enable or disable Next.js Draft Mode for Strapi preview.
 * GET /api/preview?secret=...&url=/about&status=draft
 * Accepts `url` (Strapi) or `path` (legacy). Secret may also be sent as
 * `x-strapi-preview-secret` or `Authorization: Bearer …`.
 */
export async function GET(request: NextRequest) {
  const secret = extractPreviewSecret(
    request.nextUrl.searchParams,
    request.headers,
  );
  const expected = process.env.STRAPI_PREVIEW_SECRET?.trim();

  let valid = false;
  try {
    valid = getAtlasStrapiClient().verifyPreviewSecret(secret);
  } catch {
    valid = secretsMatch(expected, secret);
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status")?.trim();
  const draft = await draftMode();
  if (status === "published") {
    draft.disable();
  } else {
    draft.enable();
  }

  const target = safeRedirectPath(
    request.nextUrl.searchParams.get("url") ??
      request.nextUrl.searchParams.get("path"),
  );
  redirect(target);
}
