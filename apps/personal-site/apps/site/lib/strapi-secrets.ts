/**
 * Server-only secret comparison for Strapi preview + webhook routes.
 * Never log secret values.
 */

import { timingSafeEqual } from "crypto";

export function secretsMatch(
  expected: string | null | undefined,
  provided: string | null | undefined,
): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function extractPreviewSecret(
  searchParams: URLSearchParams,
  headers: Headers,
): string | null {
  const fromQuery = searchParams.get("secret")?.trim();
  if (fromQuery) return fromQuery;

  const fromHeader = headers.get("x-strapi-preview-secret")?.trim();
  if (fromHeader) return fromHeader;

  return extractBearerOrRaw(headers.get("authorization"));
}

export function extractWebhookSecret(headers: Headers): string | null {
  const fromHeader = headers.get("x-strapi-webhook-secret")?.trim();
  if (fromHeader) return fromHeader;
  return extractBearerOrRaw(headers.get("authorization"));
}

function extractBearerOrRaw(authorization: string | null): string | null {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (!trimmed) return null;
  const bearer = /^Bearer\s+(.+)$/i.exec(trimmed);
  return (bearer?.[1] ?? trimmed).trim() || null;
}

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path) return "/";
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.includes("://") || trimmed.includes("\\")) return "/";
  return trimmed;
}
