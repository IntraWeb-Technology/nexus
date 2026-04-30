# `@repo/ops`

Operational scripts that **mutate or inspect external systems** (Vercel env, stack checks, seeds, CRM setup) live here so ownership and repeatability stay clear. Runtime Next.js apps do not import this package.

Apps **delegate** operational entrypoints here (for example `pnpm --filter @repo/iw-portal verify:stack` runs `@repo/ops` under the hood).

## Internal layout (`src/`)

| Folder | Ownership |
| --- | --- |
| `vercel/` | Vercel CLI–driven env sync and allowlists (`vercel-align-env`, `vercel-prune-dev-env`, `vercel-kv-list`). |
| `env/` | Portal script env validation (`applyIwPortalEnvValidation` → `@repo/env`) and Supabase URL/service-role resolution for ops scripts. |
| `repo/` | Monorepo root resolution and `apps/iw-portal/.env.local` path helpers. |
| `diagnostics/` | Read-only stack / integration alignment checks (no writes to external systems beyond probe API calls documented per script). |

Avoid adding generic `utils/` or `helpers/` trees; new code should land under the folder that matches its responsibility.

## Scripts (`pnpm --filter @repo/ops <script>`)

| Script | Source file | Notes |
| --- | --- | --- |
| `diagnostics:verify-stack` | `src/diagnostics/verify-stack-alignment.ts` | Loads portal `.env.local`, `applyIwPortalEnvValidation` default **strict**. Checks Supabase URL vs JWT `ref` vs `POSTGRES_HOST`, optional Postgres `os_*` tables, PostgREST head on `os_deals_sheet`, HubSpot + Clerk API reachability. Exits `1` on Supabase ref mismatch. |
| `vercel:align-env` | `src/vercel/vercel-align-env.ts` | Pushes whitelisted portal keys from `apps/iw-portal/.env.local` to the linked Vercel project (`cwd` = `apps/iw-portal`). Default `applyIwPortalEnvValidation` mode **report**. |
| `vercel:list-env-keys` | `src/vercel/vercel-kv-list.ts` | Loads the module that exports `PORTAL_ENV_KEYS` (same as importing it from TypeScript; useful for smoke-checking resolution). |
| `vercel:prune-dev-env` | `src/vercel/vercel-prune-dev-env.ts` | Removes portal keys from Vercel **development** target only. Default validation **off**. |

**Portal aliases:** `apps/iw-portal/package.json` maps `verify:stack`, `vercel:align-env`, and `vercel:prune-dev-env` to `pnpm --filter @repo/ops …` so operators can keep using `pnpm --filter @repo/iw-portal …` from the repo root.

### Stack verification (direct)

```sh
pnpm --filter @repo/ops diagnostics:verify-stack
```

## Build

- `pnpm build` / `pnpm check-types` — TypeScript emit for the package entry (`exports`); `tsx` scripts under `src/` are executed directly and are not required to be consumed via `dist/`.

## Candidate future migrations

| Current script | Current location | Migration risk | Notes |
| --- | --- | --- | --- |
| `seed.ts` | `apps/iw-portal/scripts/seed.ts` | **High** | Supabase/Postgres |
| `seed-test-client.ts` | `apps/iw-portal/scripts/seed-test-client.ts` | **High** | Clerk + HubSpot test IDs |
| `upsert-jschibelli-portal.ts` | `apps/iw-portal/scripts/upsert-jschibelli-portal.ts` | **High** | Named env keys |
| `apply-portal-schema-postgres.ts` | `apps/iw-portal/scripts/apply-portal-schema-postgres.ts` | **High** | Schema apply |
| `verify-stripe-subscription-sync.ts` | `apps/iw-portal/scripts/verify-stripe-subscription-sync.ts` | **Medium** | n8n + HubSpot |
| `setup-maintenance-products.ts` | `apps/iw-portal/scripts/setup-maintenance-products.ts` | **High** | Stripe |
| `test-n8n-add-invoice.ts` | `apps/iw-portal/scripts/test-n8n-add-invoice.ts` | **Medium** | Integration smoke |
| HubSpot / Stripe / n8n folders | `apps/iw-portal/scripts/...` | **High** | Leave colocated until an explicit phase |

`vercel-align-env`, `vercel-prune-dev-env`, `vercel-kv-list`, and `verify-stack-alignment` now live only under `packages/ops/src/` (portal-owned copies removed).
