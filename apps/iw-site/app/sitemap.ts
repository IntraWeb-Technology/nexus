import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-url'

/** Public indexable paths (aligned with App Router pages; excludes /404, /500, /services). */
const PATHS = [
  '/',
  '/about',
  '/accessibility',
  '/agent-readiness',
  '/ai-engineering',
  '/ai-transformation',
  '/careers',
  '/careers/business-development-rep',
  '/careers/full-stack-developer',
  '/careers/marketing-content-strategist',
  '/careers/operations-analyst',
  '/careers/senior-automation-engineer',
  '/contact',
  '/faq',
  '/implementation',
  '/privacy-policy',
  '/process',
  '/terms-of-service',
  '/thank-you',
  '/website-intake',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, '')
  return PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
}
