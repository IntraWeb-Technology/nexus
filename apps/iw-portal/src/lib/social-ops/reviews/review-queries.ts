import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReviewBundle, ReviewItemRow } from '@/lib/social-ops/types'

export async function listReviewItems(
  supabase: SupabaseClient,
  options?: { status?: string; limit?: number },
): Promise<ReviewItemRow[]> {
  let query = supabase
    .from('review_item')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 50)

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ReviewItemRow[]
}

export async function fetchReviewBundle(
  supabase: SupabaseClient,
  reviewItemId: string,
): Promise<ReviewBundle | null> {
  const { data: review, error: reviewError } = await supabase
    .from('review_item')
    .select('*')
    .eq('id', reviewItemId)
    .maybeSingle()

  if (reviewError) throw reviewError
  if (!review) return null

  const canonicalId = (review as ReviewItemRow).canonical_content_id

  const [canonicalRes, publicationsRes, actionsRes] = await Promise.all([
    supabase.from('canonical_content').select('*').eq('id', canonicalId).single(),
    supabase
      .from('platform_publication')
      .select('*')
      .eq('canonical_content_id', canonicalId)
      .order('platform'),
    supabase
      .from('review_action')
      .select('*')
      .eq('review_item_id', reviewItemId)
      .order('created_at', { ascending: true }),
  ])

  if (canonicalRes.error) throw canonicalRes.error
  if (publicationsRes.error) throw publicationsRes.error
  if (actionsRes.error) throw actionsRes.error

  return {
    review: review as ReviewItemRow,
    canonical: canonicalRes.data,
    publications: publicationsRes.data ?? [],
    actions: actionsRes.data ?? [],
  }
}

export async function listReviewBundles(
  supabase: SupabaseClient,
  options?: { status?: string; limit?: number },
): Promise<ReviewBundle[]> {
  const items = await listReviewItems(supabase, options)
  const bundles: ReviewBundle[] = []
  for (const item of items) {
    const bundle = await fetchReviewBundle(supabase, item.id)
    if (bundle) bundles.push(bundle)
  }
  return bundles
}
