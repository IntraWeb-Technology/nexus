import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import type { Plan } from '@/lib/supabase/types'
import type { ReactNode } from 'react'

function planTitle(plan: Plan): string {
  if (plan === 'growth') return 'Growth'
  if (plan === 'starter') return 'Starter'
  return 'Custom'
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-[var(--iw-teal)]"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BulletIcon() {
  return (
    <svg
      className="mt-1.5 shrink-0 text-[var(--iw-text-3)]"
      width="6"
      height="6"
      viewBox="0 0 6 6"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="2.5" fill="currentColor" />
    </svg>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-[var(--iw-text-2)]">
          <CheckIcon />
          {item}
        </li>
      ))}
    </ul>
  )
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static content
        <li key={i} className="flex items-start gap-2 text-sm text-[var(--iw-text-2)]">
          <BulletIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function ScopePage() {
  const bundle = await getPortalBundle()
  if (!bundle) return <PortalDataUnavailable />
  const { plan, slug } = bundle.project
  const title = planTitle(plan)

  return (
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Scope of Work</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--iw-text-2)]">
          What&apos;s included for your{' '}
          <span className="font-medium text-[var(--iw-text)]">{title}</span> engagement on project{' '}
          <span className="iw-mono font-medium text-[var(--iw-text)]">{slug}</span>. Your executed
          agreement, statement of work, and any change orders remain the legal source of truth if
          they differ from this summary.
        </p>
      </div>

      <Card>
        <p className="iw-label mb-2">Engagement overview</p>
        <p className="text-sm leading-relaxed text-[var(--iw-text-2)]">
          IntraWeb delivers modern web experiences, automation, and integrations aligned with your
          go-to-market and operations. Work is organized into discovery, build, quality assurance,
          launch, and (where applicable) ongoing partnership. Your portal stays aligned with project
          status, billing, and milestones unless your SOW specifies otherwise.
        </p>
      </Card>

      {plan === 'custom' ? (
        <Card>
          <p className="iw-label mb-2">Custom engagement</p>
          <p className="text-sm leading-relaxed text-[var(--iw-text-2)]">
            Your scope is defined in your signed statement of work and proposals. Deliverables may
            include any combination of web, automation, integrations, data, AI-assisted workflows,
            and retainers as listed there. Use this portal for milestones, documents, billing, and
            messaging — your project team can clarify how each line item maps to delivery phases.
          </p>
        </Card>
      ) : null}

      {plan === 'starter' ? <StarterDeliverables /> : null}
      {plan === 'growth' ? <GrowthDeliverables /> : null}

      <Card>
        <p className="iw-label mb-3">Client responsibilities</p>
        <BulletList
          items={[
            'Timely access to stakeholders for discovery, reviews, and approvals.',
            'Brand assets, logos, and style guidance (or approval to work from IntraWeb defaults).',
            'Final copy for pages unless copywriting is explicitly included in your SOW or plan.',
            'Credentials and approvals for third-party systems (DNS, hosting, CRM, email, analytics, ads).',
            'Compliance with your industry rules (privacy, accessibility targets, disclaimers) as you define them.',
            <>
              Payment per the schedule in your agreement; third-party fees (registrars, SaaS, ad
              spend) are yours unless otherwise contracted.
            </>,
          ]}
        />
      </Card>

      <Card>
        <p className="iw-label mb-3">Out of scope (unless added by change order)</p>
        <BulletList
          items={[
            'Paid media, SEO retainers, and ongoing content calendars beyond what is explicitly scoped.',
            'Custom mobile apps (native iOS/Android) unless specified in your SOW.',
            'Legacy system rewrites or data migration beyond the integrations agreed for this engagement.',
            'Photography, videography, and illustration outside any agreed asset package.',
            '24/7 on-call support or dedicated infrastructure operations unless contracted.',
            'Legal review, IP registration, or compliance certification (SOC, HIPAA, etc.) unless explicitly included.',
          ]}
        />
      </Card>

      <Card>
        <p className="iw-label mb-2">Scope changes</p>
        <p className="text-sm leading-relaxed text-[var(--iw-text-2)]">
          Work outside what is listed here — new features, extra pages, more integrations, or
          different timelines — needs a written agreement with updated schedule and fees. Verbal
          requests do not change scope until they are documented and approved. Use{' '}
          <span className="font-medium text-[var(--iw-text)]">Scope changes</span> in the sidebar
          when you are ready to request an update.
        </p>
      </Card>

      <Card>
        <p className="iw-label mb-3">Assumptions &amp; dependencies</p>
        <BulletList
          items={[
            'APIs and third-party services remain available on their documented terms; breaking API changes may require additional work.',
            <>
              Staging and production environments are provided as agreed (e.g. Vercel and your DNS);
              SSL and DNS are configured per your access level.
            </>,
            'Training and handoff are scoped to the systems we build or integrate for this project.',
          ]}
        />
      </Card>
    </div>
  )
}

function StarterDeliverables() {
  return (
    <div className="iw-enter-stagger space-y-4">
      <Card>
        <p className="iw-label mb-3">Starter — discovery &amp; alignment</p>
        <CheckList
          items={[
            'Kickoff, success metrics, sitemap, and technical constraints for a focused launch.',
            'Alignment with your CRM and lead flow for forms and handoff of leads.',
            'Written recap of decisions, assumptions, and approval checkpoints.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — UX, UI &amp; front end</p>
        <CheckList
          items={[
            'Up to five primary pages and supporting layouts (e.g. home, services, about, contact, legal shell).',
            'Responsive layouts for modern browsers and mobile viewports; accessible patterns per project standards.',
            'Reusable components and content sections appropriate to the agreed sitemap.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — forms, leads &amp; automation</p>
        <CheckList
          items={[
            'Contact and lead capture forms with validation, spam mitigation, and routing into your stack.',
            'Lead intake automation (e.g. notifications, CRM fields, basic workflows) as scoped.',
            'Coordination with your email/automation tools within reasonable API limits.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — quality, hosting &amp; launch</p>
        <CheckList
          items={[
            'QA pass on agreed browsers/devices; fixes for defects attributable to delivery.',
            'Deployment to Vercel (or equivalent agreed host), environment configuration, and go-live support.',
            'DNS cutover guidance and post-launch smoke checks.',
            'Handoff documentation for content updates and operational runbooks at a level appropriate to Starter.',
          ]}
        />
      </Card>
    </div>
  )
}

function GrowthDeliverables() {
  return (
    <div className="iw-enter-stagger space-y-4">
      <Card>
        <p className="iw-label mb-2">Growth — includes Starter</p>
        <p className="text-sm leading-relaxed text-[var(--iw-text-2)]">
          Growth includes everything in the Starter scope above (discovery, core site and layouts,
          forms and lead automation, QA, Vercel deployment, and launch support), plus the following
          additions.
        </p>
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — integrations &amp; data</p>
        <CheckList
          items={[
            'Deeper integrations with your stack (CRM, calendar, payments, analytics) within agreed APIs and limits.',
            'Mapping of fields, pipelines, and handoffs between your site, CRM, and operational tools as scoped.',
            'Practical error handling, logging hooks, and operational notes for supported integrations.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — AI, booking &amp; payments</p>
        <CheckList
          items={[
            'AI-assisted features and configuration (e.g. chat, routing, content assistance) as defined in your SOW.',
            'Scheduling and booking flows connected to your calendar or booking tool when included.',
            'Payment flows via agreed processor (e.g. Stripe Checkout) for scoped products or services.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — content, reporting &amp; experience</p>
        <CheckList
          items={[
            'Copywriting for agreed pages or sections (volume and rounds defined in your SOW).',
            'Dashboard or reporting touchpoints (e.g. Looker Studio, CRM reports) when included in scope.',
            'Enhanced client-facing experience: portal alignment, notifications, and milestone visibility as implemented for your project.',
          ]}
        />
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — launch &amp; partnership</p>
        <CheckList
          items={[
            'Structured UAT support and prioritization of launch-blocking issues.',
            'Post-launch stabilization window as agreed (severity-based response for defects in delivered work).',
            'Ongoing retainer or MRR items only as listed in your agreement (setup, tier, and monthly retainer SKUs).',
          ]}
        />
      </Card>
    </div>
  )
}
