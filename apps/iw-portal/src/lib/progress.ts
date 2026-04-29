import type { SupabaseClient } from '@supabase/supabase-js'

/** Progress from milestone counts: nearest 5%, min 0 max 100 */
export function progressFromMilestones(doneCount: number, total: number): number {
  if (total <= 0) return 0
  const raw = (doneCount / total) * 100
  const rounded = Math.round(raw / 5) * 5
  return Math.min(100, Math.max(0, rounded))
}

/** Recompute `projects.progress_pct` from milestone rows (done / total). */
export async function recalculateProjectProgressPct(
  supabase: SupabaseClient,
  projectId: string,
): Promise<void> {
  const { data: ms } = await supabase.from('milestones').select('status').eq('project_id', projectId)
  const total = ms?.length ?? 0
  const done = ms?.filter((m) => m.status === 'done').length ?? 0
  const pct = progressFromMilestones(done, total)
  await supabase.from('projects').update({ progress_pct: pct }).eq('id', projectId)
}
