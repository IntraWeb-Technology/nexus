import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/strapi-secrets";

export const dynamic = "force-dynamic";

/**
 * Disable Next.js Draft Mode.
 * GET /api/exit-preview?path=/
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const target = safeRedirectPath(request.nextUrl.searchParams.get("path"));
  redirect(target);
}
