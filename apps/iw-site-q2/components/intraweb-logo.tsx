import Image from "next/image";

/** Full horizontal lockup: symbol + “IntraWeb.” from `/IW-logo-q2.png` (transparent). */
export function IntraWebLogo({
  height = 32,
  className,
  priority = false,
}: {
  /** Display height in px; width follows asset aspect. */
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const w = Math.round(height * 4.2);
  return (
    <Image
      src="/IW-logo-q2.png"
      alt="IntraWeb."
      width={w}
      height={height}
      className={className}
      priority={priority}
      style={{
        height,
        width: "auto",
        maxWidth: "min(100%, 280px)",
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
