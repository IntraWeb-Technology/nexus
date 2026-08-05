'use client'

import type { MaintenanceFeature, MaintenanceTier } from '@/config/maintenance-features'

function IncludedIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#1D9E75" />
        <path d="M4.2 8.1 6.8 10.4 11.8 5.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#9CA3AF" fillOpacity="0.4" />
      <path d="m5 5 6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function MaintenanceFeatureRow({
  feature,
  currentTier,
}: {
  feature: MaintenanceFeature
  currentTier: MaintenanceTier
}) {
  const included = feature.includedIn.includes(currentTier)
  const inclusionLabel = included ? 'included' : 'not included in this tier'

  return (
    <div
      className="flex items-center gap-2 text-[13px]"
      aria-label={`${feature.label}, ${inclusionLabel}`}
      title={feature.tooltip}
    >
      <IncludedIcon included={included} />
      <span className={included ? 'text-[var(--iw-text-primary)]' : 'text-[var(--iw-text-secondary)]'}>
        {feature.label}
      </span>
      <span
        className="cursor-help border-b border-dotted border-[var(--iw-text-muted)] text-[var(--iw-text-muted)]"
        tabIndex={0}
        aria-label={feature.tooltip}
      >
        ⓘ
      </span>
    </div>
  )
}
