import { strapi } from "../config";

/**
 * Minimal Strapi 5 REST client (Document Service REST).
 *
 * SAFETY: this file must never log `strapi.token`. Only the presence/absence
 * of a token is logged, never its value.
 */

export class StrapiUnreachableError extends Error {}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (strapi.token) headers.Authorization = `Bearer ${strapi.token}`;
  return headers;
}

/** Encode a nested filter object into Strapi's bracket query-string notation. */
function encodeQueryParams(params: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          parts.push(...encodeQueryParams(v as Record<string, unknown>, `${paramKey}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${paramKey}[${i}]`)}=${encodeURIComponent(String(v))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...encodeQueryParams(value as Record<string, unknown>, paramKey));
    } else {
      parts.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

export function buildQueryString(params: Record<string, unknown>): string {
  const parts = encodeQueryParams(params);
  return parts.length ? `?${parts.join("&")}` : "";
}

async function request<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  urlPath: string,
  body?: unknown
): Promise<T> {
  const url = `${strapi.url}${urlPath}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new StrapiUnreachableError(
      `Could not reach Strapi at ${strapi.url} (${(err as Error).message}). Is it running?`
    );
  }

  const text = await res.text();
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    // non-JSON response, fall through with raw text below
  }

  if (!res.ok) {
    const message =
      json?.error?.message || json?.message || text || `HTTP ${res.status}`;
    throw new Error(`Strapi ${method} ${urlPath} failed (${res.status}): ${message}`);
  }

  return json as T;
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    await request("GET", "/api/sites?pagination[pageSize]=1");
    return true;
  } catch {
    return false;
  }
}

export interface StrapiEntry {
  documentId: string;
  [key: string]: any;
}

export async function findOne(
  uid: string,
  filters: Record<string, unknown>,
  populate?: string[]
): Promise<StrapiEntry | undefined> {
  const query = buildQueryString({
    filters,
    pagination: { pageSize: 1 },
    ...(populate ? { populate } : {}),
  });
  const result = await request<{ data: StrapiEntry[] }>("GET", `/api/${uid}${query}`);
  return result.data?.[0];
}

export async function findMany(
  uid: string,
  filters: Record<string, unknown> = {},
  pageSize = 100
): Promise<StrapiEntry[]> {
  const query = buildQueryString({ filters, pagination: { pageSize } });
  const result = await request<{ data: StrapiEntry[] }>("GET", `/api/${uid}${query}`);
  return result.data ?? [];
}

export async function createEntry(
  uid: string,
  payload: Record<string, unknown>
): Promise<StrapiEntry> {
  const result = await request<{ data: StrapiEntry }>("POST", `/api/${uid}`, { data: payload });
  return result.data;
}

export async function updateEntry(
  uid: string,
  documentId: string,
  payload: Record<string, unknown>
): Promise<StrapiEntry> {
  const result = await request<{ data: StrapiEntry }>("PUT", `/api/${uid}/${documentId}`, {
    data: payload,
  });
  return result.data;
}

export async function publishEntry(uid: string, documentId: string): Promise<void> {
  await request("POST", `/api/${uid}/${documentId}/actions/publish`);
}

/** Wrap a many-relation id array in Strapi v5's explicit `set` form so the
 * result is idempotent on both create and update (fully replaces membership
 * rather than only connecting). */
export function relationSet(ids: Array<number | string>): { set: Array<number | string> } {
  return { set: ids };
}
