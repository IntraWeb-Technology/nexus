"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/primitives";
import { MOTION_APPEAR } from "@/lib/motion-tokens";

/** One-shot opacity appear — minimal travel (proof cards, SC-03) */
export function AppearOnScroll({
  children,
  className = "",
  delay = 0,
  y = MOTION_APPEAR.y,
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
