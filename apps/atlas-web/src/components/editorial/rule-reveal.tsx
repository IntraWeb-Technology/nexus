"use client";

import { useRef } from "react";
import { useRevealPhase } from "@/lib/motion";

type RuleRevealProps = {
  className?: string;
  once?: boolean;
};

/**
 * Editorial hairline that draws left-to-right on first reveal.
 * Static and visible until the client mounts.
 */
export function RuleReveal({ className = "", once = true }: RuleRevealProps) {
  const ref = useRef<HTMLHRElement | null>(null);
  const phase = useRevealPhase(ref, { once });

  return (
    <hr
      ref={ref}
      aria-hidden="true"
      className={`atlas-rule-reveal ${className}`.trim()}
      data-phase={phase}
    />
  );
}
