import Image from "next/image";

type FigureProps = {
  /** Accessible name for the media plane */
  alt: string;
  caption: string;
  className?: string;
  mediaClassName?: string;
  /** Secondary = paper evidence plane; ink = dark production surface. */
  tone?: "secondary" | "ink";
  /**
   * Mono overlay labeling media type (Image Direction).
   * Hidden when production `src` is present.
   */
  label?: string;
  /** Label placement — articles center; case studies default end. */
  labelAlign?: "center" | "end";
  /**
   * Optional hero panel layout for placeholder application screenshots.
   * Disabled when production `src` is present.
   */
  panels?: boolean;
  /**
   * Neutral media URL — static `/images/...` now; Strapi CDN later.
   * When set, renders via `next/image` and retires placeholder chrome.
   */
  src?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

/**
 * Evidence figure with caption.
 * Accepts optional `src` (M7+) without changing the caption contract.
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
  src,
  width,
  height,
  sizes,
  priority = false,
}: FigureProps) {
  const hasMedia = Boolean(src && width && height);
  const mediaTone =
    tone === "ink"
      ? "bg-atlas-ink border border-atlas-border rounded-[2px]"
      : "bg-atlas-secondary";

  const showPlaceholderChrome = !hasMedia && Boolean(label || panels);
  const alignClass =
    labelAlign === "center"
      ? "flex flex-col items-center justify-center p-3 tablet:p-3.5 desktop:p-7"
      : "flex flex-col justify-end p-3 tablet:p-3.5 desktop:p-7";

  return (
    <figure className={className}>
      <div
        className={`relative overflow-hidden ${
          showPlaceholderChrome ? alignClass : ""
        } ${hasMedia ? "bg-atlas-secondary" : mediaTone} ${mediaClassName}`.trim()}
        {...(hasMedia
          ? {}
          : {
              role: "img" as const,
              "aria-label": alt,
            })}
      >
        {hasMedia ? (
          <Image
            src={src!}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            unoptimized={src!.endsWith(".svg")}
            className={
              src!.endsWith(".svg")
                ? "h-full w-full object-contain object-center p-4"
                : "h-full w-full object-cover object-top"
            }
          />
        ) : (
          <>
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
          </>
        )}
      </div>
      <figcaption className="mt-3 font-sans text-xs leading-normal text-atlas-body">
        {caption}
      </figcaption>
    </figure>
  );
}
