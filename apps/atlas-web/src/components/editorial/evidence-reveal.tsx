"use client";

import {
  Children,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRevealPhase } from "@/lib/motion";

type EvidenceRevealProps = {
  children: ReactNode;
  /** Stagger between items in ms (40–80 recommended). */
  stagger?: number;
  once?: boolean;
  className?: string;
};

/**
 * Grouped evidence-panel reveal with a small reading-order stagger.
 * No fake loading. Visible until client mount; pending only below the fold.
 */
export function EvidenceReveal({
  children,
  stagger = 60,
  once = true,
  className = "",
}: EvidenceRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const phase = useRevealPhase(ref, { once });
  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => {
        const style =
          phase === "shown" && stagger > 0
            ? ({
                transitionDelay: `${index * stagger}ms`,
              } satisfies CSSProperties)
            : undefined;

        return (
          <div
            key={index}
            className="atlas-evidence-item"
            data-phase={phase}
            style={style}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
