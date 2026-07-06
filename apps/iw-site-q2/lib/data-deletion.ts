import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const TOKEN_EXPIRY_MS = 72 * 60 * 60 * 1000;

export function getDataDeletionSecret(): string {
  return (
    process.env.DATA_DELETION_SECRET?.trim() ||
    process.env.WEBHOOK_SECRET?.trim() ||
    process.env.N8N_WEBHOOK_SECRET?.trim() ||
    ""
  );
}

export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateVerificationToken(requestId: string, email: string): string {
  const secret = getDataDeletionSecret();
  if (!secret) throw new Error("DATA_DELETION_SECRET is not configured");
  const payload = `${requestId}:${email.trim().toLowerCase()}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyVerificationToken(requestId: string, email: string, token: string): boolean {
  const secret = getDataDeletionSecret();
  if (!secret || !token) return false;
  const expected = generateVerificationToken(requestId, email);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(token, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isRequestExpired(createdAtIso: string): boolean {
  const created = Date.parse(createdAtIso);
  if (Number.isNaN(created)) return true;
  return Date.now() - created > TOKEN_EXPIRY_MS;
}

export function siteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "https://intrawebtech.com";
}

export function buildVerificationUrl(requestId: string, email: string, token: string): string {
  const base = siteBaseUrl();
  const params = new URLSearchParams({
    request_id: requestId,
    email: email.trim().toLowerCase(),
    token,
  });
  return `${base}/data-deletion/confirm?${params.toString()}`;
}

export type DataDeletionRequestType = "delete_personal_data" | "marketing_opt_out" | "access_copy";
