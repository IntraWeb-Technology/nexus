export type MaintenanceTier = 'essential' | 'standard' | 'premium'

export type MaintenanceCadence = 'monthly' | 'annual'

export type MaintenanceFeature = {
  id: string
  label: string
  tooltip: string
  includedIn: MaintenanceTier[]
}

export const MAINTENANCE_FEATURES: MaintenanceFeature[] = [
  {
    id: 'uptime-monitoring',
    label: '24/7 uptime monitoring',
    tooltip: 'Automated uptime checks with proactive alerting when availability or latency degrades.',
    includedIn: ['essential', 'standard', 'premium'],
  },
  {
    id: 'security-updates',
    label: 'Security patching and dependency updates',
    tooltip: 'Routine patch windows to keep framework, plugins, and critical dependencies updated.',
    includedIn: ['essential', 'standard', 'premium'],
  },
  {
    id: 'performance-optimization',
    label: 'Performance optimization passes',
    tooltip: 'Scheduled tuning for Core Web Vitals, caching behavior, and high-impact bottlenecks.',
    includedIn: ['standard', 'premium'],
  },
  {
    id: 'conversion-reviews',
    label: 'Conversion flow reviews',
    tooltip: 'Monthly review of key conversion funnels and implementation recommendations.',
    includedIn: ['standard', 'premium'],
  },
  {
    id: 'priority-support',
    label: 'Priority response SLA',
    tooltip: 'Priority support queue with faster guaranteed first-response windows.',
    includedIn: ['premium'],
  },
  {
    id: 'phone-hotline',
    label: 'Phone hotline access',
    tooltip: 'Direct hotline access for urgent incidents during business hours.',
    includedIn: ['premium'],
  },
]

export const TIER_META: Record<
  MaintenanceTier,
  {
    name: string
    tagline: string
    monthlyHours: number
    slaHours: number
  }
> = {
  essential: {
    name: 'Essential Care',
    tagline: 'Reliable maintenance coverage for stable, lower-change projects.',
    monthlyHours: 4,
    slaHours: 24,
  },
  standard: {
    name: 'Standard Care',
    tagline: 'Balanced support for ongoing optimization and iterative growth.',
    monthlyHours: 8,
    slaHours: 12,
  },
  premium: {
    name: 'Premium Care',
    tagline: 'High-touch maintenance with fastest response and strategic support.',
    monthlyHours: 16,
    slaHours: 4,
  },
}

export function maintenanceLookupKey(tier: MaintenanceTier, cadence: MaintenanceCadence): string {
  return `maintenance_${tier}_${cadence}`
}
