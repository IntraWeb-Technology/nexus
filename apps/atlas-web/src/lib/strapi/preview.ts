import { draftMode } from "next/headers";
import type { ContentOptions } from "@/lib/content";

/** Merge caller options with Next.js Draft Mode when Strapi preview is active. */
export async function mergePreviewOptions(
  options?: ContentOptions,
): Promise<ContentOptions> {
  if (options?.preview === true || options?.preview === false) {
    return options;
  }

  try {
    const draft = await draftMode();
    if (draft.isEnabled) {
      return { ...options, preview: true };
    }
  } catch {
    // draftMode is unavailable outside a request context
  }

  return options ?? {};
}
