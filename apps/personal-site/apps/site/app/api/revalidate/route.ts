import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  PERSONAL_SITE_KEY,
  parseRevalidatePayload,
  resolveRevalidatePaths,
  shouldRevalidateForSite,
} from "@/lib/strapi-revalidate";
import { extractWebhookSecret, secretsMatch } from "@/lib/strapi-secrets";

export const dynamic = "force-dynamic";

/**
 * Strapi publishing webhook → selective `revalidatePath` (site key: personal).
 * POST only. Header: `x-strapi-webhook-secret` or `Authorization`.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.STRAPI_WEBHOOK_SECRET?.trim();
  const provided = extractWebhookSecret(request.headers);

  if (!secretsMatch(expected, provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRevalidatePayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { payload } = parsed;

  if (!shouldRevalidateForSite(payload, PERSONAL_SITE_KEY)) {
    return NextResponse.json({
      revalidated: false,
      paths: [],
      reason: `siteKeys does not include ${PERSONAL_SITE_KEY}`,
    });
  }

  const paths = resolveRevalidatePaths(payload);
  if (paths.length === 0) {
    return NextResponse.json({
      revalidated: false,
      paths: [],
      reason: `No paths mapped for uid ${payload.uid}`,
    });
  }

  const revalidated: string[] = [];
  for (const path of paths) {
    try {
      if (
        payload.uid === "api::navigation.navigation" ||
        payload.uid === "api::site-setting.site-setting"
      ) {
        revalidatePath(path, "layout");
      } else {
        revalidatePath(path);
      }
      revalidated.push(path);
    } catch (error) {
      console.error(
        `[revalidate] failed for ${path}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return NextResponse.json({
    revalidated: revalidated.length > 0,
    paths: revalidated,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
