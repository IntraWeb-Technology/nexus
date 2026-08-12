/**
 * Normalize the various date shapes found across sources into ISO-8601:
 * - Hashnode mirror: `Thu Oct 17 2024 04:00:00 GMT+0000 (Coordinated Universal Time)`
 *   (this is literally `Date.prototype.toString()` output, native `Date` parses it fine)
 * - Portfolio-native frontmatter: `2025-10-13` or `2025-01-10`
 * - Project TS data: `2024-04-01`
 */
export function normalizeDate(input: unknown): string | undefined {
  if (input === null || input === undefined || input === "") return undefined;

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? undefined : input.toISOString();
  }

  const raw = String(input).trim();
  if (!raw) return undefined;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function isValidDate(input: unknown): boolean {
  return normalizeDate(input) !== undefined;
}
