import Image from "next/image";

/** Teal + orange “IW” mark from `/intraweb-symbol.png` (transparent background). */
export function IntraWebSymbol({
  size = 28,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  /** Set on first paint (e.g. nav) to avoid flash. */
  priority?: boolean;
}) {
  return (
    <Image
      src="/intraweb-symbol.png"
      alt=""
      width={size}
      height={size}
      className={className}
      priority={priority}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
