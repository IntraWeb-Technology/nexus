/**
 * Shared motion constants — doctrine-aligned (subtle, no loops, respects reduced motion).
 * @see docs/doctrine/03-environmental-doctrine.md
 * @see docs/implementation-governance/01-forbidden-refactors.md F-09 (Argument band: no scroll fade)
 */

export const MOTION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)" as const;

/** Scroll-entry reveal (section intros) */
export const MOTION_REVEAL = {
  y: 14,
  durationMs: 400,
  delayMs: 0,
} as const;

/** Hero mount sequence */
export const MOTION_HERO = {
  y: 18,
  durationMs: 480,
  staggerMs: 70,
} as const;

/** Friction grid line stagger */
export const MOTION_STAGGER = {
  lineMs: 50,
  maxLines: 9,
} as const;

/** Proof artifact one-shot appear (SC-03: no “elegant” motion) */
export const MOTION_APPEAR = {
  y: 8,
  durationMs: 320,
  staggerMs: 60,
} as const;

/** Ken Burns on hero photography */
export const MOTION_HERO_KEN_BURNS = {
  durationSec: 22,
} as const;
