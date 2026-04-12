import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** Absolute path to @repo/n8n-workflows package root (workflow JSON tree). */
export function getN8nWorkflowsRoot() {
  return path.dirname(require.resolve("@repo/n8n-workflows/package.json"));
}

/**
 * Resolve a CLI path: absolute, legacy `n8n-workflows/...`, or relative to the workflows package root.
 */
export function resolveWorkflowPath(p) {
  if (p == null || p === "") return p;
  if (path.isAbsolute(p)) return p;
  const norm = p.replace(/\\/g, "/");
  const root = getN8nWorkflowsRoot();
  if (norm.startsWith("n8n-workflows/")) {
    return path.join(root, norm.slice("n8n-workflows/".length));
  }
  return path.join(root, norm);
}
