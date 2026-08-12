type FigureProps = {
  /** Accessible name for the media plane until a real image ships */
  alt: string;
  caption: string;
  className?: string;
  mediaClassName?: string;
  /** Secondary = paper evidence plane; ink = dark production surface. */
  tone?: "secondary" | "ink";
  /** Mono overlay labeling future media type (Image Direction). */
  label?: string;
  /** Label placement — articles center; case studies default end. */
  labelAlign?: "center" | "end";
  /** Optional hero panel layout for application screenshots */
  panels?: boolean;
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
  label,
  labelAlign = "end",
  panels = false,
}: FigureProps) {
  const mediaTone =
    tone === "ink"
      ? "bg-atlas-ink border border-atlas-border rounded-[2px]"
      : "bg-atlas-secondary";

  const padded = Boolean(label || panels);
  const alignClass =
    labelAlign === "center"
      ? "flex flex-col items-center justify-center p-3 tablet:p-3.5 desktop:p-7"
      : "flex flex-col justify-end p-3 tablet:p-3.5 desktop:p-7";

  return (
    <figure className={className}>
      <div
        className={`relative overflow-hidden ${
          padded ? alignClass : ""
        } ${mediaTone} ${mediaClassName}`.trim()}
        role="img"
        aria-label={alt}
      >
        {panels ? (
          <div
            className="mb-3 hidden h-full min-h-[12rem] flex-1 gap-3.5 desktop:flex"
            aria-hidden="true"
          >
            <div className="w-[22%] rounded-[2px] border border-atlas-border bg-atlas-elevated/5" />
            <div className="w-[53%] rounded-[2px] border border-atlas-border bg-atlas-elevated/10" />
            <div className="w-[23%] rounded-[2px] border border-atlas-border bg-atlas-elevated/[0.05]" />
          </div>
        ) : null}
        {label ? (
          <p
            className={`m-0 font-mono text-[9px] leading-normal tablet:text-[10px] desktop:text-[11px] ${
              tone === "ink" ? "text-atlas-secondary" : "text-atlas-body"
            }`}
            aria-hidden="true"
          >
            {label}
          </p>
        ) : null}
      </div>
      <figcaption className="mt-3 font-sans text-xs leading-normal text-atlas-body">
        {caption}
      </figcaption>
    </figure>
  );
}
