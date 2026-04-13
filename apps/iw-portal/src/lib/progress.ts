/** Progress from milestone counts: nearest 5%, min 0 max 100 */
export function progressFromMilestones(doneCount: number, total: number): number {
  if (total <= 0) return 0
  const raw = (doneCount / total) * 100
  const rounded = Math.round(raw / 5) * 5
  return Math.min(100, Math.max(0, rounded))
}
