"use client";

import type { ReactNode } from "react";
import { AppearOnScroll } from "@/components/motion/appear-on-scroll";
import { MOTION_APPEAR } from "@/lib/motion-tokens";

export function ProofArtifactAppear({ index, children }: { index: number; children: ReactNode }) {
  return <AppearOnScroll delay={index * MOTION_APPEAR.staggerMs}>{children}</AppearOnScroll>;
}
