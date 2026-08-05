# Automations — setup

## Prerequisites

- Access to the IntraWeb n8n instance
- `N8N_API_URL` or `N8N_BASE_URL`
- `N8N_API_KEY`
- Optional `N8N_WORKFLOWS_PROJECT_ID` (`all` for full instance)
- Portal `WEBHOOK_SECRET` aligned with workflows that call `/api/webhook/n8n`
- Marketing secret **separate** from portal secret

## Install / sync tooling

From monorepo root:

```sh
pnpm --filter @repo/n8n-workflows pull:n8n
pnpm --filter @repo/n8n-workflows sync:n8n:package
pnpm --filter @repo/n8n-workflows push:n8n:workflow "packages/n8n-workflows/<path>/<file>.json"
```

Full procedure: `packages/n8n-workflows/RUNBOOK.md`.

## Connecting portal and n8n

1. Set portal env: `N8N_BASE_URL`, `WEBHOOK_SECRET`, optional `N8N_API_*` for scripts.
2. In workflows that POST to the portal, send header `x-intrawebtech-secret: <WEBHOOK_SECRET>`.
3. Confirm Clerk proxy allows `/api/webhook/n8n` (public to Clerk; secret-checked in handler).
4. For privacy deletion and social-ops internal routes, verify proxy exemptions — **current code may block machine callers** (see audit).

## Staging vs production

Prefer env/config nodes over hard-coded `dashboard.intrawebtech.com` and Drive folder IDs. Several curated workflows still hard-code production hosts — treat staging parity as incomplete.
