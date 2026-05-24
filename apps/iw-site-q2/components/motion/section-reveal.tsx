"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/primitives";
import { MOTION_REVEAL } from "@/lib/motion-tokens";

/** Section intro scroll reveal — defaults from motion tokens */
export function SectionReveal({
  children,
  className = "",
  delay = MOTION_REVEAL.delayMs,
  y = MOTION_REVEAL.y,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <Reveal delay={delay} y={y} className={className}>
      {children}
    </Reveal>
  );
}
