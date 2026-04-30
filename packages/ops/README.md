# `@repo/ops`

Scaffold for **operational scripts** (stack verification, env alignment, CRM/Stripe setup, seeds) that today live next to apps.

No scripts have been moved yet. This package exists so future migrations have a clear target without changing runtime behavior.

## Candidate migrations

| Current script | Current location | Proposed owner | Migration risk | Notes |
| --- | --- | --- | --- | --- |
| `seed.ts` | `apps/iw-portal/scripts/seed.ts` | `@repo/ops` | **High** | Touches Supabase/Postgres; must keep `pnpm` script paths and env loading stable. |
| `seed-test-client.ts` | `apps/iw-portal/scripts/seed-test-client.ts` | `@repo/ops` | **High** | Clerk + HubSpot test IDs; dev-only. |
| `upsert-jschibelli-portal.ts` | `apps/iw-portal/scripts/upsert-jschibelli-portal.ts` | `@repo/ops` | **High** | Named env keys; used from root `package.json`. |
| `apply-portal-schema-postgres.ts` | `apps/iw-portal/scripts/apply-portal-schema-postgres.ts` | `@repo/ops` | **High** | Schema apply; TLS workaround in script — review before move. |
| `verify-stack-alignment.ts` | `apps/iw-portal/scripts/verify-stack-alignment.ts` | `@repo/ops` | **Medium** | Read-only checks; popular for onboarding. |
| `verify-stripe-subscription-sync.ts` | `apps/iw-portal/scripts/verify-stripe-subscription-sync.ts` | `@repo/ops` | **Medium** | Uses n8n + HubSpot overrides. |
| `vercel-align-env.ts` | `apps/iw-portal/scripts/vercel-align-env.ts` | `@repo/ops` | **High** | Mutates remote Vercel env; strict review. |
| `vercel-prune-dev-env.ts` | `packages/ops/src/vercel-prune-dev-env.ts` | `@repo/ops` | **High** | Destructive to preview env. |
| `vercel-kv-list.ts` | `apps/iw-portal/scripts/vercel-kv-list.ts` | `@repo/ops` | **Low** | Listing utility. |
| `setup-maintenance-products.ts` | `apps/iw-portal/scripts/setup-maintenance-products.ts` | `@repo/ops` | **High** | Stripe catalog mutations. |
| `update-payment-links.js` | `apps/iw-portal/scripts/update-payment-links.js` | `@repo/ops` | **High** | Stripe; legacy JS — consider TS port when moving. |
| `test-n8n-add-invoice.ts` | `apps/iw-portal/scripts/test-n8n-add-invoice.ts` | `@repo/ops` | **Medium** | Manual integration smoke. |
| `cleanup-verify-subscriptions.ts` | `apps/iw-portal/scripts/cleanup-verify-subscriptions.ts` | `@repo/ops` | **Medium** | Confirm scope before move. |
| `ensure-change-order-properties.ts` | `apps/iw-portal/scripts/hubspot/ensure-change-order-properties.ts` | `@repo/ops` | **High** | HubSpot schema mutations. |
| `ensure-subscription-deal-properties.ts` | `apps/iw-portal/scripts/hubspot/ensure-subscription-deal-properties.ts` | `@repo/ops` | **High** | HubSpot schema mutations. |
| `ensure-change-order-form.ts` | `apps/iw-portal/scripts/hubspot/ensure-change-order-form.ts` | `@repo/ops` | **High** | HubSpot form setup. |
| `update-change-order-form.ts` | `apps/iw-portal/scripts/hubspot/update-change-order-form.ts` | `@repo/ops` | **High** | HubSpot form updates. |
| `change-order-form-fields.ts` | `apps/iw-portal/scripts/hubspot/change-order-form-fields.ts` | `@repo/ops` | **Low** | Shared field defs; may stay colocated with HubSpot scripts. |
| `supabase-env.ts`, `supabase-schema-check.ts`, `repo-root.ts` | `apps/iw-portal/scripts/lib/` | `@repo/ops` (or `@repo/env`) | **Medium** | Shared script libs — extract after first consumer is stable. |

## Scripts

- `pnpm build` / `pnpm check-types` — TypeScript emit for the placeholder module only.
