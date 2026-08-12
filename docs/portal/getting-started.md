# Portal — getting started

## Prerequisites

- Node 22.x, pnpm 10.x
- Access to monorepo `E:/…/nexus` (or clone)
- Clerk, Supabase, Stripe, HubSpot, Resend, n8n credentials as required for the flows you will run

## Install

```sh
pnpm install
pnpm --filter @repo/iw-portal dev
```

Dev server defaults to port **3002**.

## Environment

- Root / app env examples: `.env.example`, `docs/architecture/environment-contract.md`
- Never commit `.env*.local`

Minimum groups: Clerk public+secret, Supabase URL + anon/publishable + service role, `WEBHOOK_SECRET`, Stripe keys if testing billing.

## Database

Migrations live in `apps/iw-portal/supabase/migrations/`.

```sh
pnpm --filter @repo/iw-portal db:link   # when using hosted Supabase CLI link
pnpm --filter @repo/iw-portal db:push   # apply — use only with correct project target
```

Self-hosted notes: `docs/architecture/supabase-self-host-hostinger.md`.

## Authentication

- Clerk application with sign-in/up routes under `src/app/(auth)/`
- Staff bootstrap: `apps/iw-portal/docs/admin-bootstrap.md` — **also read audit note**: empty staff allowlist can auto-admin; set allowlist env in every environment

## n8n connectivity

- `N8N_BASE_URL` + `WEBHOOK_SECRET`
- Contracts: `apps/iw-portal/docs/n8n-integration.md`
- Automations: `docs/automations/overview.md`

## Build / deploy

```sh
pnpm --filter @repo/iw-portal check-types
pnpm --filter @repo/iw-portal lint
pnpm --filter @repo/iw-portal test
pnpm --filter @repo/iw-portal build
```

Vercel: project root `apps/iw-portal`; see `vercel.json` (includes social-ops outbox cron).

Deployment runbook: `docs/architecture/deployment-runbook.md`.
