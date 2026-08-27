"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export type RevealPhase = "ssr" | "pending" | "shown";

type UseRevealPhaseOptions = {
  once?: boolean;
  /** IntersectionObserver threshold. */
  threshold?: number;
};

export type RevealEntryClassification = "ignore" | "shown" | "shown-disconnect" | "pending";

export type RevealEntryInput = {
  once: boolean;
  alreadyShown: boolean;
  hasEntry: boolean;
  isIntersecting: boolean;
  display: string;
  visibility: string;
  rectTop: number;
  rectBottom: number;
  viewportHeight: number;
};

/**
 * Classifies one IntersectionObserver notification.
 * Parent (`d0044a4`) never moved `shown` back to `pending`, including `once=false`.
 */
export function classifyRevealEntry(input: RevealEntryInput): RevealEntryClassification {
  if (!input.hasEntry) return "ignore";
  if (input.alreadyShown && input.once) return "ignore";

  if (input.display === "none" || input.visibility === "hidden") {
    return "shown";
  }

  const alreadyVisible =
    input.rectTop < input.viewportHeight * 0.92 && input.rectBottom > 0;

  if (alreadyVisible || input.isIntersecting) {
    return input.once ? "shown-disconnect" : "shown";
  }

  // Parent IO ignored non-intersecting updates after shown, including once=false.
  if (input.alreadyShown) return "ignore";
  return "pending";
}

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
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const result = classifyRevealEntry({
          once,
          alreadyShown: shownRef.current,
          hasEntry: Boolean(entry),
          isIntersecting: Boolean(entry?.isIntersecting),
          display: style.display,
          visibility: style.visibility,
          rectTop: rect.top,
          rectBottom: rect.bottom,
          viewportHeight: window.innerHeight,
        });

        if (result === "ignore") return;
        if (result === "pending") {
          setPhase("pending");
          return;
        }

        shownRef.current = true;
        setPhase("shown");
        if (result === "shown-disconnect") io.disconnect();
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, reduced, once, threshold]);

  if (reduced) return "shown";
  return phase;
}
