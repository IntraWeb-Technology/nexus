# `@repo/ops`

Operational scripts that **mutate or inspect external systems** (Vercel env, stack checks, seeds, CRM setup) are being moved here from app folders so ownership and repeatability stay clear. Runtime Next.js apps do not import this package.

## Scripts (`pnpm --filter @repo/ops <script>`)

| Script | Source file | Notes |
| --- | --- | --- |
| `vercel:align-env` | `src/vercel-align-env.ts` | Pushes whitelisted portal keys from `apps/iw-portal/.env.local` to the linked Vercel project (`cwd` = `apps/iw-portal`). Default `applyIwPortalEnvValidation` mode **report**. |
| `vercel:prune-dev-env` | `src/vercel-prune-dev-env.ts` | Removes portal keys from Vercel **development** target only. Default validation **off**. |

**Portal aliases:** `apps/iw-portal/package.json` maps `vercel:align-env` and `vercel:prune-dev-env` to `pnpm --filter @repo/ops …` so operators can keep using `pnpm --filter @repo/iw-portal vercel:align-env` from the repo root.

## Shared Vercel / portal script helpers (`src/`)

These mirror the former `apps/iw-portal/scripts/lib` (and `vercel-kv-list`) sources so ops scripts typecheck with `rootDir: src` and run under `tsx` with NodeNext-style `.js` import specifiers:

- `src/lib/repo-root.ts` — `resolveMonorepoRoot`, `iwPortalEnvLocalPath`
- `src/lib/iw-portal-env-check.ts` — `applyIwPortalEnvValidation` → `@repo/env` `validateIwPortalEnv`
- `src/vercel-kv-list.ts` — `PORTAL_ENV_KEYS`

**Duplication note:** `apps/iw-portal/scripts/vercel-kv-list.ts` is still present for ad-hoc `tsx` runs documented in architecture inventory; it should stay in sync with `packages/ops/src/vercel-kv-list.ts` until a dedicated dedupe pass removes risk of drift.

## Build

- `pnpm build` / `pnpm check-types` — TypeScript emit for the package entry (`exports`); tsx scripts under `src/` are executed directly and are not required to be consumed via `dist/`.

## Candidate future migrations

| Current script | Current location | Migration risk | Notes |
| --- | --- | --- | --- |
| `seed.ts` | `apps/iw-portal/scripts/seed.ts` | **High** | Supabase/Postgres |
| `seed-test-client.ts` | `apps/iw-portal/scripts/seed-test-client.ts` | **High** | Clerk + HubSpot test IDs |
| `upsert-jschibelli-portal.ts` | `apps/iw-portal/scripts/upsert-jschibelli-portal.ts` | **High** | Named env keys |
| `apply-portal-schema-postgres.ts` | `apps/iw-portal/scripts/apply-portal-schema-postgres.ts` | **High** | Schema apply |
| `verify-stack-alignment.ts` | `apps/iw-portal/scripts/verify-stack-alignment.ts` | **Medium** | Read-only checks |
| `verify-stripe-subscription-sync.ts` | `apps/iw-portal/scripts/verify-stripe-subscription-sync.ts` | **Medium** | n8n + HubSpot |
| `vercel-kv-list.ts` | `apps/iw-portal/scripts/vercel-kv-list.ts` | **Low** | Listing; ops already has a copy — dedupe entrypoint next |
| `setup-maintenance-products.ts` | `apps/iw-portal/scripts/setup-maintenance-products.ts` | **High** | Stripe |
| `test-n8n-add-invoice.ts` | `apps/iw-portal/scripts/test-n8n-add-invoice.ts` | **Medium** | Integration smoke |
| HubSpot / Stripe / n8n folders | `apps/iw-portal/scripts/...` | **High** | Leave colocated until an explicit phase |

`vercel-align-env.ts` and `vercel-prune-dev-env.ts` now live only under `packages/ops/src/` (portal-owned copies removed).
