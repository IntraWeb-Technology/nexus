"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export type RevealPhase = "ssr" | "pending" | "shown";

type UseRevealPhaseOptions = {
  once?: boolean;
  /** IntersectionObserver threshold. */
  threshold?: number;
};

/**
 * Progressive-enhancement reveal phases:
 * - `ssr`: visible (no hidden styles) until the client wrapper mounts
 * - `pending`: only after mount, when the element is below the fold
 * - `shown`: revealed (or reduced-motion / already in view)
 */
export function useRevealPhase(
  ref: RefObject<HTMLElement | null>,
  options: UseRevealPhaseOptions = {},
): RevealPhase {
  const { once = true, threshold = 0.12 } = options;
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<RevealPhase>("ssr");
  const shownRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Read preference directly so we never arm pending before the hook settles.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || reduced) {
      shownRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (shownRef.current && once) return;

        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") {
          // Hidden breakpoints stay "shown" so they never stick pending.
          shownRef.current = true;
          setPhase("shown");
          return;
        }

        const rect = el.getBoundingClientRect();
        const alreadyVisible =
          rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

        if (alreadyVisible || entry.isIntersecting) {
          shownRef.current = true;
          setPhase("shown");
          if (once) io.disconnect();
          return;
        }

        setPhase("pending");
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, reduced, once, threshold]);

  if (reduced) return "shown";
  return phase;
}
