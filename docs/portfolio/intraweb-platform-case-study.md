# IntraWeb Platform — Portfolio Case Study

**Role:** Senior software engineer / product builder  
**Product:** IntraWeb Technologies operating platform  
**Audience:** Founders and technical decision makers  
**Live surfaces:** [intrawebtech.com](https://intrawebtech.com) (marketing) · authenticated client & staff portal  
**Engagement type:** Platform · Integration · Delivery OS  
**Status:** Production core live; roadmap continues on editorial and content systems

---

## Summary

IntraWeb needed an operating system for how the company sells, delivers, and maintains client work — not another project tracker and not a locked-in SaaS product. The platform connects a public marketing site, a multi-tenant client portal, a staff operations console, and an automation layer that keeps CRM, billing, email, and provisioning in sync.

The result is durable infrastructure: clients get one place for progress, documents, messaging, and billing; staff get an operations surface instead of inbox triage; inbound demand becomes provisioned workspaces instead of spreadsheet handoffs.

---

## Business problem

Growing operators (roughly 20–150 people) and the firms that serve them hit the same structural failure: systems that do not talk, handoffs that break, and delivery that lives in email threads and shared sheets.

For IntraWeb specifically, the cost of that failure was internal as well as external:

- Prospect interest stopped at forms and calendars; conversion did not reliably become a ready workspace.
- Client delivery status lived across tools — hard for clients to see progress, harder for staff to govern scope and billing.
- Approvals, documents, invoices, and change requests required manual chase across channels.
- Staff work was reactive: messages, at-risk projects, and contractual changes competed for attention without a single command surface.

The underlying gap was not “more automation.” It was missing **operational infrastructure** — designed connections between how work is sold, how it is delivered, and how it is billed.

---

## Solution

A three-surface platform, built as one monorepo and operated as one delivery OS:

| Surface | Who it serves | What it does |
|---------|---------------|--------------|
| **Marketing site** | Prospects and operators | Recognition-led positioning, diagnostic booking, website/project intake, protected conversion flows |
| **Client portal** | Client project owners and billing contacts | Dashboard, progress & approvals, messaging, documents & e-sign, billing, change orders, notifications |
| **Staff admin OS** | IntraWeb admin / ops / support | Operations queue, client & project oversight, message triage, change-order review, billing visibility, integration health, settings & roles |

An **automation layer** sits beside the apps — not as the product, but as the fabric that moves events between the portal, CRM, payments, email, and internal ops. Marketing and portal share the same commercial spine: interest → CRM → kickoff → provisioned portal access.

Positioning constraint that shaped product decisions: IntraWeb builds infrastructure that connects how a company works to how it scales — not agency theater, not SaaS lock-in, and not automation-as-the-pitch.

---

## Outcomes

### For clients

- One authenticated home for project status, milestones, proposals, and phase approvals.
- Document list, download, and e-signature with audit-ready signature fields.
- Messaging with staff that does not depend on buried email threads.
- Invoices and subscriptions with checkout and customer portal flows; payment state stays aligned with the CRM when configured.
- Contractual change orders with PDF artifacts instead of informal scope drift.

### For staff

- Role-based access (admin, ops, support, viewer) with an audit trail for sensitive mutations.
- An operations queue for at-risk work and pending contractual changes.
- Message triage, client/project CRM-style oversight, billing visibility, and integration event visibility with replay where needed.
- Data-health checks that surface integrity problems before they become delivery failures.

### For the business

- Marketing conversion paths (contact, diagnostic, website intake) wired into CRM and follow-up mail — not dead-end forms.
- Privacy / data-subject deletion request flows on the public site with internal execution support.
- Dual-app production deploy with shared monorepo tooling and CI gates (lint, typecheck, build).
- A curated automation catalog covering lead routing, sales, onboarding, client success, and reporting — versioned with the product rather than living only in a vendor UI.

*Metrics below are scope and capability indicators from the production system, not invented client ROI claims.*

| Indicator | Scale |
|-----------|------:|
| Client + staff portal page surfaces | ~30 |
| Marketing page surfaces | 13 |
| Portal API capabilities | ~36 route handlers |
| Database migrations (schema evolution) | 19 |
| Curated automation workflows | ~40 |
| Staff admin modules | 12 |

---

## Architecture highlights

Designed for founders who care about reliability and for engineers who care about whether the seams hold.

### System shape

```
Prospect / Client / Staff
        │
   ┌────┴────┐
   │ Browser │
   └────┬────┘
        │
   ┌────┴─────────────────┐
   │ Marketing │ Portal   │  ← Next.js apps (separate Vercel projects)
   └────┬─────────┬───────┘
        │         │
   Auth │    Data │ Payments │ CRM │ Email │ Automation
 (Clerk)  (Postgres + Storage) (Stripe) (HubSpot) (Resend) (n8n)
```

### Decisions that matter

| Choice | Why it fits |
|--------|-------------|
| **Next.js for marketing and portal** | One runtime for SEO/SSR public pages and authenticated product UI; APIs colocated with the surfaces that need them |
| **Postgres with row-level isolation** | Multi-client portal without building a custom tenancy framework; storage for private uploads scoped to owned work |
| **Hosted auth with satellite domains** | Clean sign-in across accounts / portal / dashboard without forcing a single brittle hostname |
| **Staff roles in the data layer** | Product permissions (admin / ops / support / viewer) stay enforceable and auditable |
| **Payments + CRM as first-class** | Billing and deal state are part of delivery, not afterthoughts bolted on later |
| **Automation as orchestration, not the app** | HubSpot, Drive, email, and provisioning stay composable; the portal remains the system of record for client delivery |
| **Monorepo + dual deploy** | Shared standards and packages; isolated env and release risk between public site and authenticated product |
| **CI quality gates** | Lint, typecheck, and build must pass before merge — credibility starts before production |

### Integration surface (production)

Clerk · Supabase (Postgres / Storage) · Stripe · HubSpot · n8n · Resend · Cal.com · reCAPTCHA Enterprise — each used for a named operational job, not as a logo wall.

### What was deliberately not built yet

Full client multi-member role console, portal-side AI assistant, and social auto-publish remain roadmap. The case study claims only what ships in production core.

---

## User experience

### Prospect

1. Land on a recognition-led homepage (friction → proof → model → fit).
2. Explore services or book a Systems Call / Diagnostic.
3. Submit contact or multi-step website intake with bot protection.
4. Land on confirmation; CRM and mail follow without staff re-keying the lead.

### Client

1. Sign in → dashboard with plan, progress, and live operational cards.
2. Review timeline and milestones; approve phases when ready.
3. Message staff, request or sign documents, manage invoices and payment methods.
4. Submit change orders when scope must change formally — not in a side chat.

### Staff

1. Open the admin OS → see counts, recent activity, and health entry points.
2. Work the operations queue; triage client messages; review change orders.
3. Inspect clients, projects, billing, and integration events when something looks wrong.
4. Adjust roles and feature flags with admin-only mutations and audit logging.

### Design posture

Marketing visuals follow IntraWeb doctrine: dark / white / orange, operational tone, recognition over persuasion. Portal and admin prioritize clarity for repeated daily use — server-rendered primary flows, minimal client-side state, and explicit statuses over decorative dashboards.

---

## Technical credibility

Signals that matter when evaluating a senior engineer who owns product end-to-end:

- **Full-stack product ownership** — positioning, conversion, authenticated UX, APIs, schema, webhooks, and ops tooling in one coherent system.
- **Security-minded multi-tenancy** — client data isolation, staff RBAC, webhook signature verification, and privacy deletion request handling.
- **Commercial systems literacy** — Stripe checkout / subscriptions / customer portal and HubSpot deal/contact flows treated as product infrastructure.
- **Operational reliability** — integration event logging, data-health checks, staff audit log, health endpoints, and documented deployment/environment contracts.
- **Automation with boundaries** — workflows versioned in-repo; the app remains the client-facing system of record.
- **Engineering hygiene** — Turborepo monorepo, shared lint/TS configs, Zod validation at boundaries, CI on main/development, dual-app Vercel production.
- **Honest roadmap** — in-progress and planned work called out rather than oversold as live.

### Proof you can inspect without credentials

- Public marketing site: [https://intrawebtech.com](https://intrawebtech.com)
- Conversion products: `/services`, `/diagnostic`, `/contact`, `/start`
- Legal and privacy surfaces including data-deletion request flow

Portal and admin require authenticated sessions; demos are available under NDA or scheduled walkthrough.

---

## Engagement snapshot

| Field | Value |
|-------|--------|
| Industry context | Services / B2B operations platform (builder’s own delivery OS) |
| Company size served | Target buyers 20–150; platform users = IntraWeb clients + staff |
| Primary friction resolved | Delivery & commercial handoffs (lead → workspace → approve → bill) |
| Implementation posture | Iterative production ship; core portal + admin + marketing live |
| Timeline character | Multi-month platform build with continuous hardening |

---

## Closing operational state

Prospects enter through a governed marketing funnel. Clients work from one portal for progress, documents, messaging, and billing. Staff run delivery from an admin OS instead of reconstructing status from inboxes. CRM, payments, and email stay connected through an automation fabric that IntraWeb owns and versions — so the company scales on infrastructure, not heroics.

---

## Related documentation (monorepo)

- Implementation audit: [`docs/audit/`](../audit/README.md)
- Portal docs: [`docs/portal/`](../portal/README.md)
- Automations docs: [`docs/automations/`](../automations/README.md)
- Public portfolio case study: Portfolio OS `/case-studies/intraweb`

*Derived from the IntraWeb Platform Product Dossier and the 2026-07-30 implementation audit. External claims limited to Implemented production capabilities unless explicitly labeled Partial/Experimental. Internal paths, secrets, schema inventories, and runbook specifics intentionally omitted from public surfaces.*
