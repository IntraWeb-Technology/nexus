import { SkeletonCard } from '@/components/ui/SkeletonCard'

/** Full-page loading skeleton that mirrors the typical portal page structure. */
export default function PortalLoading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading page content">
      {/* Page header skeleton */}
      <header className="border-b border-[var(--iw-border)] pb-8">
        <div className="iw-shimmer-bar h-7 w-56 rounded-md" />
        <div className="iw-shimmer-bar mt-3 h-4 w-80 max-w-full rounded-full" />
      </header>

      {/* KPI stat grid (mirrors dashboard 4-up layout) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>

      {/* Main content cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>

      {/* Secondary content row */}
      <SkeletonCard lines={3} />
    </div>
  )
}
