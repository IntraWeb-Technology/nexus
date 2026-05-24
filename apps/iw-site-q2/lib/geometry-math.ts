export type Point = { x: number; y: number };

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function angle(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function bezierControlPoint(
  start: Point,
  end: Point,
  curvature: number
): Point {
  const mid = midpoint(start, end);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return {
    x: mid.x - dy * curvature,
    y: mid.y + dx * curvature,
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
