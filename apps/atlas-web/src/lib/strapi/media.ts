import type { PublishingMedia } from "@repo/strapi-client";

/** Map CMS publishing.media → Atlas optional image fields. Absence is legitimate (A-05). */
export function mediaFields(media: PublishingMedia | null | undefined): {
  src?: string;
  width?: number;
  height?: number;
  sizes?: string;
  alt?: string;
  caption?: string;
  captionShort?: string;
  label?: string;
  composed?: "rsc-request-path" | "atlas-boundaries";
} {
  if (!media) return {};

  const composed =
    media.composedKey === "rsc-request-path" || media.composedKey === "atlas-boundaries"
      ? media.composedKey
      : undefined;

  const asset = media.asset;
  return {
    alt: media.alt,
    caption: media.caption ?? undefined,
    captionShort: media.captionShort ?? undefined,
    label: media.label ?? undefined,
    sizes: media.sizes ?? undefined,
    composed,
    src: asset?.url,
    width: asset?.width ?? undefined,
    height: asset?.height ?? undefined,
  };
}
