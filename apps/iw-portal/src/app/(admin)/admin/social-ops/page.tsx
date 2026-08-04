import { AdminPageHeader, EmptyState } from '@/components/admin/AdminPrimitives'
import { ReviewItemCard } from '@/components/admin/social-ops/ReviewItemCard'
import { canMutateStaff, requireStaff } from '@/lib/admin/auth'
import { listReviewBundles } from '@/lib/social-ops/reviews/review-queries'
import { createRlsSupabaseForUser } from '@/lib/supabase/server'

type PageProps = {
  searchParams: Promise<{ review?: string; status?: string }>
}

export default async function SocialOpsReviewPage({ searchParams }: PageProps) {
  const staff = await requireStaff()
  const params = await searchParams
  const supabase = await createRlsSupabaseForUser()
  if (!supabase) {
    throw new Error('Supabase RLS client unavailable')
  }

  const bundles = await listReviewBundles(supabase, {
    status: params.status,
    limit: 50,
  })

  const highlightId = params.review

  return (
    <div className="iw-page">
      <AdminPageHeader
        title="Social review"
        description="Review editorial drafts ingested from the content pipeline. Decisions are stored as immutable review actions."
      />
      <div className="space-y-4">
        {bundles.length ? (
          bundles.map((bundle) => (
            <ReviewItemCard
              key={bundle.review.id}
              bundle={bundle}
              canMutate={canMutateStaff(staff.role)}
              defaultExpanded={highlightId === bundle.review.id}
            />
          ))
        ) : (
          <EmptyState>No social review items yet. They appear after the editorial workflow ingests Postiz drafts.</EmptyState>
        )}
      </div>
    </div>
  )
}
