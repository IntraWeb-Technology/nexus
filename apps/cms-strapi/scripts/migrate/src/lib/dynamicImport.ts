import { pathToFileURL } from "node:url";

/**
 * Dynamically import a `.ts` data module (relies on this whole tool running
 * under `tsx`, which transpiles on the fly — no build step needed). Falls
 * back to `undefined` on any failure so callers can degrade to a regex-based
 * extraction instead of crashing the batch.
 */
export async function tryDynamicImport(filePath: string): Promise<Record<string, unknown> | undefined> {
  try {
    const url = pathToFileURL(filePath).href;
    const mod = await import(url);
    return mod as unknown as Record<string, unknown>;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[dynamicImport] Failed to import ${filePath}: ${(err as Error).message}`);
    return undefined;
  }
}
