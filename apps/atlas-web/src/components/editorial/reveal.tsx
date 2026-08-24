"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { type MotionDistance, useRevealPhase } from "@/lib/motion";

export type RevealProps = {
  children: ReactNode;
  delay?: number;
  once?: boolean;
  distance?: MotionDistance;
  className?: string;
};

/**
 * Major section / content-group reveal.
 * Visible by default until the client mounts; pending hide only after mount
 * when the element is below the fold.
 */
export function Reveal({
  children,
  delay = 0,
  once = true,
  distance = "sm",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useRevealPhase(ref, { once });

  const style =
    delay > 0
      ? ({ transitionDelay: `${delay}ms` } satisfies CSSProperties)
      : undefined;

  return (
    <div
      ref={ref}
      className={`atlas-reveal ${className}`.trim()}
      data-phase={phase}
      data-distance={distance}
      style={style}
    >
      {children}
    </div>
  );
}
