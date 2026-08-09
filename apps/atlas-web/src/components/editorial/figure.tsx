type FigureProps = {
  /** Accessible name for the media plane until a real image ships */
  alt: string;
  caption: string;
  className?: string;
  mediaClassName?: string;
  /** Secondary = paper evidence plane; ink = dark production surface (Work featured). */
  tone?: "secondary" | "ink";
};

/**
 * Evidence figure with caption. Empty planes until assets land (Image Direction).
 * Future: accept `src` via next/image without changing the caption contract.
 */
export function Figure({
  alt,
  caption,
  className = "",
  mediaClassName = "",
  tone = "secondary",
}: FigureProps) {
  const mediaTone =
    tone === "ink"
      ? "bg-atlas-ink border border-atlas-border rounded-[2px]"
      : "bg-atlas-secondary";

  return (
    <figure className={className}>
      <div
        className={`${mediaTone} ${mediaClassName}`.trim()}
        role="img"
        aria-label={alt}
      />
      <figcaption className="mt-3 font-sans text-xs leading-normal text-atlas-body">
        {caption}
      </figcaption>
    </figure>
  );
}
