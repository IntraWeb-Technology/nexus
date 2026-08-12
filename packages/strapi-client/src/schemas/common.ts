import { z } from "zod";

/** Envelope for Strapi 5 `GET /api/:plural` list responses. */
export const strapiListResponseSchema = z.object({
  data: z.array(z.unknown()).nullable(),
  meta: z
    .object({
      pagination: z
        .object({
          page: z.number(),
          pageSize: z.number(),
          pageCount: z.number(),
          total: z.number(),
        })
        .partial()
        .optional(),
    })
    .catchall(z.unknown())
    .optional()
    .nullable(),
});

/** Envelope for Strapi 5 `GET /api/:plural/:documentId` single responses. */
export const strapiSingleResponseSchema = z.object({
  data: z.unknown().nullable(),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type FlatEntry = Record<string, unknown> & {
  id?: number | string;
  documentId?: string;
};

/**
 * Flatten a Strapi entry to a plain object with attributes at the top level.
 * Supports Strapi 5's flat documents as well as legacy `{ id, attributes }`
 * and relation/media `{ data: ... }` wrappers, since some deploys and proxies
 * still emit the v4 shape.
 */
export function flattenEntry(raw: unknown): FlatEntry | null {
  if (raw == null) return null;
  if (typeof raw !== "object") return null;

  const entry = raw as Record<string, unknown>;

  if ("data" in entry && Object.keys(entry).length <= 2) {
    return flattenEntry(entry.data);
  }

  if (
    entry.attributes &&
    typeof entry.attributes === "object" &&
    !Array.isArray(entry.attributes)
  ) {
    const attrs = entry.attributes as Record<string, unknown>;
    const mergedId = entry.id ?? attrs.id;
    const mergedDocumentId =
      (typeof entry.documentId === "string" ? entry.documentId : undefined) ??
      (typeof attrs.documentId === "string" ? attrs.documentId : undefined);

    return {
      ...attrs,
      ...(mergedId !== undefined ? { id: mergedId as string | number } : {}),
      ...(mergedDocumentId !== undefined
        ? { documentId: mergedDocumentId }
        : {}),
    };
  }

  return entry as FlatEntry;
}

export function flattenEntries(raw: unknown): FlatEntry[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => flattenEntry(item))
      .filter((item): item is FlatEntry => item != null);
  }
  if (typeof raw === "object" && raw !== null && "data" in raw) {
    return flattenEntries((raw as { data: unknown }).data);
  }
  const single = flattenEntry(raw);
  return single ? [single] : [];
}

export function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function asJsonArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value;
}

export function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null {
  const raw = asString(value);
  if (!raw) return null;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

export function documentIdOf(entry: FlatEntry): string {
  const id = asString(entry.documentId) ?? (entry.id != null ? String(entry.id) : null);
  if (!id) throw new Error("Entry is missing documentId/id");
  return id;
}

/** Pull a single relation (`{ data: {...} }` or flat) as a flattened entry. */
export function pickRelation(entry: FlatEntry, key: string): FlatEntry | null {
  return flattenEntry(entry[key]);
}

/** Pull a to-many relation (`{ data: [...] }` or flat array) as flattened entries. */
export function pickRelationList(entry: FlatEntry, key: string): FlatEntry[] {
  return flattenEntries(entry[key]);
}
