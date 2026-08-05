# IntraWeb Nexus portal — overview

**App:** `apps/iw-portal`  
**Live surface:** authenticated dashboard (`dashboard.intrawebtech.com`; legacy `portal.*` redirects)  
**Audience:** IntraWeb clients (project owners) and IntraWeb staff (admin/ops/support/viewer)

## What it is

Nexus is IntraWeb’s **business operations platform**: a multi-tenant client portal plus staff operations console, backed by Postgres (Supabase), Clerk auth, Stripe billing, HubSpot CRM mirroring, Resend email, and n8n orchestration.

## Problems it addresses

- Delivery status scattered across email and sheets
- Manual handoffs from CRM “won” to a usable client workspace
- Approvals, documents, invoices, and change orders without a single client home
- Staff triage without a command surface

## High-level architecture

See `docs/architecture/system-overview.md` and `docs/audit/nexus-n8n-integration-map.md`.

```text
Client / Staff browser
        │
   iw-portal (Next.js)
        │
 Clerk · Supabase · Stripe · HubSpot · Resend · n8n
```

## Current implementation status

| Area | Status |
| --- | --- |
| Client portal core | Implemented |
| Staff admin core | Implemented |
| Billing + Stripe | Implemented |
| n8n provisioning paths | Partially Implemented (see automations docs) |
| Social Ops | Experimental |
| Member invites | Partially Implemented / schema ahead of UX |
| Feature flags | Experimental (not consumed) |

Detailed capability list: `docs/audit/nexus-implementation-audit.md`.

## Doc map

| Doc | Audience |
| --- | --- |
| [getting-started.md](./getting-started.md) | Engineers |
| [user-guide.md](./user-guide.md) | Clients |
| [admin-guide.md](./admin-guide.md) | Staff |
| [architecture.md](./architecture.md) | Engineers |
| [api.md](./api.md) | Engineers / integrators |
| [troubleshooting.md](./troubleshooting.md) | Operators |
