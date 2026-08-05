import { strapi } from "../config";

/**
 * OPTIONAL, best-effort media migration. Off by default (`--with-media` to
 * enable). Downloads a remote image and uploads it to the Strapi Media
 * Library, returning the numeric upload-plugin file id to use in a media
 * relation. Any failure is caught and logged — a missing image must never
 * abort the rest of the migration.
 */
export async function uploadMediaFromUrl(
  sourceUrl: string,
  fileNameHint: string
): Promise<number | undefined> {
  try {
    const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`fetch failed with ${res.status}`);
    const blob = await res.blob();
    const extension = guessExtension(res.headers.get("content-type") ?? undefined, sourceUrl);
    const form = new FormData();
    form.append("files", blob, `${fileNameHint}${extension}`);

    const uploadRes = await fetch(`${strapi.url}/api/upload`, {
      method: "POST",
      headers: strapi.token ? { Authorization: `Bearer ${strapi.token}` } : undefined,
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
    if (!uploadRes.ok) {
      throw new Error(`upload failed with ${uploadRes.status}: ${await uploadRes.text()}`);
    }
    const uploaded = (await uploadRes.json()) as Array<{ id: number }>;
    return uploaded[0]?.id;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[media] Skipping ${sourceUrl}: ${(err as Error).message}`);
    return undefined;
  }
}

function guessExtension(contentType: string | undefined, url: string): string {
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("jpeg")) return ".jpg";
  const match = url.match(/\.(png|jpe?g|webp|gif|svg)(?:\?|$)/i);
  return match ? `.${match[1].toLowerCase()}` : ".jpg";
}
