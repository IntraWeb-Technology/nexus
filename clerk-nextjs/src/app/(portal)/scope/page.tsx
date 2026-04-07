import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import type { Plan } from '@/lib/supabase/types'

function planTitle(plan: Plan): string {
  if (plan === 'growth') return 'Growth'
  if (plan === 'starter') return 'Starter'
  return 'Custom'
}

export default async function ScopePage() {
  const bundle = await getPortalBundle()
  if (!bundle) return <PortalDataUnavailable />
  const { plan, slug } = bundle.project
  const title = planTitle(plan)

  return (
    <div className="space-y-6">
      <div>
        <h1>Scope of Work</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--iw-text-2)]">
          This page describes what is typically included for your <span className="text-[var(--iw-text)]">{title}</span>{' '}
          engagement on project <span className="iw-mono text-[var(--iw-text)]">{slug}</span>. Your executed agreement,
          statement of work, and any change orders remain the legal source of truth if they differ from this summary.
        </p>
      </div>

      <Card>
        <p className="iw-label mb-2">Engagement overview</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          IntraWeb delivers modern web experiences, automation, and integrations aligned with your go-to-market and
          operations. Work is organized into discovery, build, quality assurance, launch, and (where applicable) ongoing
          partnership. Your portal stays aligned with project status, billing, and milestones unless your SOW specifies
          otherwise.
        </p>
      </Card>

      {plan === 'custom' ? (
        <Card>
          <p className="iw-label mb-2">Custom engagement</p>
          <p className="text-sm text-[var(--iw-text-2)]">
            Your scope is defined in your signed statement of work and proposals. Deliverables may include any
            combination of web, automation, integrations, data, AI-assisted workflows, and retainers as listed there.
            Use this portal for milestones, documents, billing, and messaging — your project team can clarify how each
            line item maps to delivery phases.
          </p>
        </Card>
      ) : null}

      {plan === 'starter' ? <StarterDeliverables /> : null}
      {plan === 'growth' ? <GrowthDeliverables /> : null}

      <Card>
        <p className="iw-label mb-3">Client responsibilities</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Timely access to stakeholders for discovery, reviews, and approvals.</li>
          <li>Brand assets, logos, and style guidance (or approval to work from IntraWeb defaults).</li>
          <li>Final copy for pages unless copywriting is explicitly included in your SOW or plan.</li>
          <li>Credentials and approvals for third-party systems (DNS, hosting, CRM, email, analytics, ads).</li>
          <li>Compliance with your industry rules (privacy, accessibility targets, disclaimers) as you define them.</li>
          <li>Payment per the schedule in your agreement; third-party fees (registrars, SaaS, ad spend) are yours unless
            otherwise contracted.</li>
        </ul>
      </Card>

      <Card>
        <p className="iw-label mb-3">Out of scope (unless added by change order)</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Paid media, SEO retainers, and ongoing content calendars beyond what is explicitly scoped.</li>
          <li>Custom mobile apps (native iOS/Android) unless specified in your SOW.</li>
          <li>Legacy system rewrites or data migration beyond the integrations agreed for this engagement.</li>
          <li>Photography, videography, and illustration outside any agreed asset package.</li>
          <li>24/7 on-call support or dedicated infrastructure operations unless contracted.</li>
          <li>Legal review, IP registration, or compliance certification (SOC, HIPAA, etc.) unless explicitly included.</li>
        </ul>
      </Card>

      <Card>
        <p className="iw-label mb-2">Change orders</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          Any work outside this scope — including new features, extra pages, additional integrations, or expanded
          timelines — requires a written change order with updated timeline and fees. Verbal requests do not change scope
          until documented and approved.
        </p>
      </Card>

      <Card>
        <p className="iw-label mb-3">Assumptions & dependencies</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>APIs and third-party services remain available on their documented terms; breaking API changes may require
            additional work.</li>
          <li>Staging and production environments are provided as agreed (e.g. Vercel and your DNS); SSL and DNS are
            configured per your access level.</li>
          <li>Training and handoff are scoped to the systems we build or integrate for this project.</li>
        </ul>
      </Card>
    </div>
  )
}

function StarterDeliverables() {
  return (
    <>
      <Card>
        <p className="iw-label mb-3">Starter — discovery & alignment</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Kickoff, success metrics, sitemap, and technical constraints for a focused launch.</li>
          <li>Alignment with your CRM and lead flow for forms and handoff of leads.</li>
          <li>Written recap of decisions, assumptions, and approval checkpoints.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — UX, UI & front end</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Up to five primary pages and supporting layouts (e.g. home, services, about, contact, legal shell).</li>
          <li>Responsive layouts for modern browsers and mobile viewports; accessible patterns per project standards.</li>
          <li>Reusable components and content sections appropriate to the agreed sitemap.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — forms, leads & automation</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Contact and lead capture forms with validation, spam mitigation, and routing into your stack.</li>
          <li>Lead intake automation (e.g. notifications, CRM fields, basic workflows) as scoped.</li>
          <li>Coordination with your email/automation tools within reasonable API limits.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Starter — quality, hosting & launch</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>QA pass on agreed browsers/devices; fixes for defects attributable to delivery.</li>
          <li>Deployment to Vercel (or equivalent agreed host), environment configuration, and go-live support.</li>
          <li>DNS cutover guidance and post-launch smoke checks.</li>
          <li>Handoff documentation for content updates and operational runbooks at a level appropriate to Starter.</li>
        </ul>
      </Card>
    </>
  )
}

function GrowthDeliverables() {
  return (
    <>
      <Card>
        <p className="iw-label mb-2">Growth — includes Starter</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          Growth includes everything in the Starter scope above (discovery, core site and layouts, forms and lead
          automation, QA, Vercel deployment, and launch support), plus the following additions.
        </p>
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — integrations & data</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Deeper integrations with your stack (CRM, calendar, payments, analytics) within agreed APIs and limits.</li>
          <li>Mapping of fields, pipelines, and handoffs between your site, CRM, and operational tools as scoped.</li>
          <li>Practical error handling, logging hooks, and operational notes for supported integrations.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — AI, booking & payments</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>AI-assisted features and configuration (e.g. chat, routing, content assistance) as defined in your SOW.</li>
          <li>Scheduling and booking flows connected to your calendar or booking tool when included.</li>
          <li>Payment flows via agreed processor (e.g. Stripe Checkout) for scoped products or services.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — content, reporting & experience</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Copywriting for agreed pages or sections (volume and rounds defined in your SOW).</li>
          <li>Dashboard or reporting touchpoints (e.g. Looker Studio, CRM reports) when included in scope.</li>
          <li>Enhanced client-facing experience: portal alignment, notifications, and milestone visibility as implemented
            for your project.</li>
        </ul>
      </Card>
      <Card>
        <p className="iw-label mb-3">Growth — launch & partnership</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
          <li>Structured UAT support and prioritization of launch-blocking issues.</li>
          <li>Post-launch stabilization window as agreed (severity-based response for defects in delivered work).</li>
          <li>Ongoing retainer or MRR items only as listed in your agreement (setup, tier, and monthly retainer SKUs).</li>
        </ul>
      </Card>
    </>
  )
}
