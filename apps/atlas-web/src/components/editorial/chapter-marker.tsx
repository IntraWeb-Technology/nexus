type ChapterMarkerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span";
  "aria-hidden"?: boolean | "true" | "false";
};

/** Tracked uppercase chapter label — never a heading substitute. */
export function ChapterMarker({
  children,
  className = "",
  as: Tag = "p",
  "aria-hidden": ariaHidden,
}: ChapterMarkerProps) {
  return (
    <Tag
      className={`atlas-chapter ${className}`.trim()}
      aria-hidden={ariaHidden}
    >
      {children}
    </Tag>
  );
}
