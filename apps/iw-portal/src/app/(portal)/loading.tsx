import { SkeletonCard } from '@/components/ui/SkeletonCard'

export default function PortalLoading() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
