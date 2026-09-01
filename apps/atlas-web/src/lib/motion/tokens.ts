/** Atlas motion tokens — durations in ms; distances in px. */

export const motionDurations = {
  instant: 80,
  fast: 140,
  base: 200,
  slow: 320,
  page: 420,
} as const;

export const motionEasings = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

export const motionDistances = {
  xs: 4,
  sm: 8,
  md: 16,
} as const;

export type MotionDistance = keyof typeof motionDistances;
