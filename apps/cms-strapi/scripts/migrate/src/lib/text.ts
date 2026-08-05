/** Strip the most common markdown syntax so we can derive a plain-text excerpt. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

export function deriveExcerpt(body: string, maxLength = 200): string {
  return truncate(stripMarkdown(body), maxLength);
}

/** Some Hashnode exports have a stray leading `/` before the real content
 * (an artifact of their export pipeline — see audit.md §3.8). Strip it. */
export function stripHashnodeLeadingSlash(content: string): string {
  return content.replace(/^\/(?!\/)/, "").trimStart();
}

/** Split a comma-separated tag string ("web-development, ai") into normalized names. */
export function splitTagString(input: string | undefined | null): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
