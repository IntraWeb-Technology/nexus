import type { MetaItem } from "@/content/types";

type MetadataRowProps = {
  items: MetaItem[];
  className?: string;
};

/**
 * Quiet Label · value metadata. Description list for a11y.
 * Desktop: horizontal columns. Use compact mono lines on narrower breakpoints
 * via page composition (Figma recomposes; do not force this grid on mobile).
 */
export function MetadataRow({ items, className = "" }: MetadataRowProps) {
  return (
    <dl
      className={`m-0 flex flex-wrap gap-0 border-t border-atlas-border pt-4 ${className}`.trim()}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-[9rem] flex-col gap-1.5 pr-12 pt-4 pb-1"
        >
          <dt className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-umber uppercase">
            {item.label}
          </dt>
          <dd className="m-0 font-mono text-xs text-atlas-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
