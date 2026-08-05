# Nexus portal — implementation audit

**App:** `apps/iw-portal` (`@repo/iw-portal`)  
**Stack:** Next.js 16 App Router, React 19, Clerk, Supabase Postgres/Storage/Realtime, Stripe, HubSpot, Resend, n8n, Tailwind CSS v4  
**Deploy:** Vercel project rooted at `apps/iw-portal` (`dashboard.intrawebtech.com`)  
**Evidence date:** 2026-07-30  

## What Nexus is (from implementation)

IntraWeb Nexus is a multi-tenant **client portal** and **staff operations console** for IntraWeb Technologies. Clients see project progress, documents, messaging, billing, and change orders. Staff oversee operations, clients, billing, integrations, and an OS command surface. An **n8n automation layer** provisions and syncs CRM/billing events into the portal; the portal remains the system of record for client delivery state.

Companion surface in the same monorepo: **`apps/iw-site-q2`** (public marketing/conversion site). Legacy `apps/iw-site` was removed from this monorepo.

## Maturity summary

| Area | Status |
| --- | --- |
| Client portal core (dashboard, progress, docs, billing, change orders, notifications) | **Implemented** |
| Staff admin core (ops, clients, projects, billing, change orders, OS, data health) | **Implemented** |
| Clerk auth + staff RBAC | **Implemented** (with critical bootstrap risk — see Security) |
| Stripe / HubSpot / n8n / Resend integrations | **Implemented** (with partial gaps) |
| Multi-project membership / invites | **Partially Implemented** |
| Social Ops review + outbox | **Experimental** |
| Feature flags UI | **Experimental** (persisted, not consumed) |
| Scope page as live SOW | **Partially Implemented** (static plan summaries) |
| Activity route | **Deprecated** (redirects to notifications) |

---

## Authentication and authorization

| Capability | Status | Evidence |
| --- | --- | --- |
| Clerk sign-in / sign-up / post-auth | Implemented | `src/app/(auth)/`, `src/app/post-auth/` |
| Route protection (proxy) | Implemented | `src/proxy.ts` |
| Satellite domains / Clerk proxy | Implemented | `src/lib/clerk-satellite.ts` |
| Clerk lifecycle webhook | Implemented | `src/app/api/webhook/clerk/route.ts` |
| Client ownership via `clients.clerk_user_id` | Implemented | `src/lib/data/portal.ts`, migrations |
| `client_members` / `project_members` portal entry | Partially Implemented | Schema + RLS exist; `getPortalBundle` only resolves owner rows |
| Staff roles `admin` / `ops` / `support` / `viewer` | Implemented | `src/lib/admin/auth.ts`, migration `010_admin_staff.sql` |
| Staff invite tables | Unverified / Planned | Schema without invitation UI/routes |
| MFA | Unverified | No portal-specific MFA UI; depends on Clerk org settings |

**Critical:** When staff-email allowlist env is empty, `ensureStaffUser` can auto-insert eligible Clerk users as `admin` (`src/lib/admin/auth.ts`). Documented bootstrap (`docs/admin-bootstrap.md`) expects manual first admin — docs and code disagree.

---

## Client portal capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| Dashboard | Implemented | Progress, milestones, billing, HubSpot deal/line items, messages, notifications, activity, OS events |
| Progress + milestone approval | Implemented | `/progress`, `POST /api/milestones/approve` |
| Proposal review | Implemented | Decision API updates OS queue, activity, HubSpot note; optional n8n |
| Messages + Realtime | Partially Implemented | Realtime thread works; send path uses oldest project, not cookie-selected active project |
| Documents (upload/download/sign) | Implemented | Private storage, signed downloads, typed-name signature |
| Billing / invoices / Stripe Checkout | Implemented | HubSpot invoice import, PDFs, customer portal, balance pay |
| Maintenance subscriptions | Implemented | Stripe subscription packages + sync |
| Change orders | Implemented | Multi-step request, PDF, HubSpot form, cancel |
| Notifications | Implemented | Merged portal + HubSpot activity |
| Settings / preferences | Partially Implemented | Read-only contact; prefs write via browser Supabase client, weak failure UX |
| Help / FAQ | Implemented | Static |
| Scope of work | Partially Implemented | Static Starter/Growth copy; not generated from signed SOW |
| Activity | Deprecated | Redirect → `/notifications` |
| Project switcher | Partially Implemented | Cookie selection for reads; several write APIs ignore it |

Routes under `src/app/(portal)/`.

---

## Staff admin capabilities

| Module | Status | Notes |
| --- | --- | --- |
| Admin overview | Implemented | Counts, triage, failures, automation, proposals |
| Clients / client detail | Implemented | Membership, mappings, notes |
| Projects | Implemented | Directory |
| Messages | Partially Implemented | List only — no reply/assign/pagination |
| Billing | Implemented | Invoice reconciliation view |
| Change orders | Implemented | Audited status updates |
| Operations queue | Implemented | Risk + pending contractual work |
| Data health | Implemented | Persisted integrity findings |
| Integrations console | Partially Implemented | “Mark replayed” is status-only, not true replay |
| OS command center | Implemented | Automation log, contract/proposal queue, mirrored deals |
| Settings / roles | Implemented | Admin-only role updates |
| Feature flags | Experimental | Toggle UI; no app consumers found |
| Social Ops reviews | Experimental | Vertical slice 1 — ingest, review, outbox |

Routes under `src/app/(admin)/admin/`.

---

## Data model (migration-backed)

Migrations: `apps/iw-portal/supabase/migrations/001`–`019`.

**Portal:** clients, projects, milestones, milestone_approvals, messages, documents, invoices, subscriptions, activity_log, notifications, notification_preferences, change_orders, notes  

**Auth/admin:** staff_users, staff_audit_log, client_members, project_members, staff_invites, client_invites, internal notes, document_access_log, integration_events, data_health_checks, feature_flags  

**OS / CRM mirror:** automation log, deals, leads, contacts, companies, contract/proposal queue, client-success, LinkedIn pipeline, reporting snapshots, pre-call intake, hubspot_crm_entities  

**Privacy:** data_subject_requests  

**Social ops:** canonical_content, platform_publication, review_item, review_action, outbox_event  

---

## Integrations (portal role)

| System | Role | Status |
| --- | --- | --- |
| Clerk | Auth, user lifecycle webhooks | Implemented |
| Supabase | Postgres, Storage, Realtime, RLS (bypassed by service-role server client) | Implemented |
| Stripe | Checkout, invoices, subscriptions, webhooks | Implemented |
| HubSpot | CRM mirror, deal stages, forms, notes | Implemented (webhook uses shared secret, not HubSpot native signature) |
| n8n | Inbound provisioning/actions; outbound event fan-out | Implemented (outbound receivers incomplete — see integration map) |
| Resend | Welcome + staff message email | Implemented |
| Google Chat (social outbox) | Notification handler | Experimental |
| Postiz | Draft IDs stored; portal does not publish | Partially Implemented |

`packages/integrations` n8n wrapper is a **scaffold that throws** — live clients live in the apps.

---

## Reliability and security (audit findings)

### Critical

1. Empty staff-email allowlist → any Clerk user may auto-bootstrap as admin.
2. Social-ops `SECURITY DEFINER` RPCs lack `REVOKE ALL … FROM PUBLIC` (unlike HubSpot mirror pattern).
3. Clerk proxy does not exempt `/api/internal/privacy/*` or `/api/internal/social-ops/*` while those handlers expect machine auth — conflicts with architecture docs.

### High

4. Server “user” Supabase client typically uses service role → RLS not enforcing tenancy; handlers must filter correctly.
5. Multi-project writes (messages, document-request, some checkout) target oldest project, not active cookie project.
6. Member access incomplete vs schema.
7. Proposal decision note HTML interpolates client text without escaping → CRM stored markup risk.
8. No rate limiting on authenticated mutating APIs.

### Medium

9. n8n inbound body mostly cast, not Zod-validated at the edge.
10. Social outbox dispatch not atomically claimed → duplicate sends under concurrent cron.
11. Settings preference silent failure.
12. Integration events store full external payloads (PII retention).
13. Portal error boundary shows raw `error.message`.
14. Integration “replay” is misleading.

Full detail and file paths live in the Phase 2 exploration notes; key files: `src/lib/admin/auth.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts`, `supabase/migrations/019_social_ops_core.sql`.

---

## UX (code-verified)

**Strengths:** loading skeletons, error boundaries with retry, empty states, responsive portal shell, skip link, focus styles, reduced-motion, accessible tabs/modals.

**Weaknesses:** admin tables may clip on mobile; message “Shift+Enter” copy on single-line input; Realtime failures not surfaced; settings lack save/fail feedback; empty vs error often indistinguishable.

---

## Testing

| Area | Coverage |
| --- | --- |
| Provision client idempotency | Unit test present |
| Privacy deletion classification | Unit test present |
| Social-ops schema/lifecycle helpers | Unit test present |
| Route auth, RLS, Stripe/HubSpot E2E, UI | **Not found** |

Observed: `pnpm --filter @repo/iw-portal test` and `check-types` reported passing during audit session (16 tests).

---

## Documentation gaps (portal-specific)

See [documentation-gap-analysis.md](./documentation-gap-analysis.md). Highest priority: user/admin guides, multi-project write contract, admin bootstrap accuracy, privacy runbook, RLS/service-role explanation.
