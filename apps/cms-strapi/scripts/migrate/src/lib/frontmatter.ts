import fs from "node:fs";
import yaml from "js-yaml";

export interface ParsedMarkdown<T = Record<string, unknown>> {
  data: T;
  content: string;
  filePath: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Read + parse a markdown/MDX file's YAML frontmatter (full YAML — handles
 * nested arrays/objects like `tags: [...]`, `metaTags: {...}`, `author: {...}`,
 * not just flat `key: value` lines). Never throws on a single bad file —
 * callers are expected to catch and record a validation issue instead of
 * crashing the whole batch. */
export function parseMarkdownFile<T = Record<string, unknown>>(
  filePath: string
): ParsedMarkdown<T> {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { data: {} as T, content: raw.trim(), filePath };
  }
  let data: unknown;
  try {
    data = yaml.load(match[1]);
  } catch (err) {
    console.warn(`[frontmatter] YAML parse error in ${filePath}: ${(err as Error).message}`);
    data = {};
  }
  return { data: (data ?? {}) as T, content: (match[2] ?? "").trim(), filePath };
}

export function listMarkdownFiles(dir: string, extensions: string[]): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => `${dir.replace(/[\\/]+$/, "")}/${entry.name}`);
}
