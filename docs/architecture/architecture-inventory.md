# Architecture inventory

Generated from repository inspection (Phase 0). Unknown items are called out explicitly.

## 1. Active apps

| App | Package name | Stack (high level) |
| --- | --- | --- |
| `apps/iw-portal` | `@repo/iw-portal` | Next.js 16, Clerk, Supabase, Stripe, Resend, Tailwind v4 |
| `apps/iw-site-q2` | `@repo/iw-site-q2` | Next.js 16, reCAPTCHA Enterprise, Cal.com, Resend, Anthropic SDK, Tailwind v4 |

**Excluded from workspace:** `apps/iw-site` (legacy marketing app; see §13).

## 2. Package list

| Package | Name | Role |
| --- | --- | --- |
| `packages/n8n-workflows` | `@repo/n8n-workflows` | Workflow JSON, pull/sync/push scripts |
| `packages/eslint-config` | `@repo/eslint-config` | Shared ESLint configs (`base`, `next-js`, `react-internal`) |
| `packages/typescript-config` | `@repo/typescript-config` | Shared `tsconfig` fragments (`base`, `nextjs`, `react-library`) |

**Root:** `package.json` name is `my-turborepo` (historical); repo is referred to as Nexus in docs.

## 3. Script inventory by package

### Root (`package.json`)

| Script | Command |
| --- | --- |
| `build` | `turbo run build` |
| `dev` | `turbo run dev` |
| `lint` | `turbo run lint` |
| `format` | Prettier write |
| `check-types` | `turbo run check-types` |
| `upsert:jschibelli` | `pnpm --filter @repo/iw-portal upsert:jschibelli` |

### `@repo/iw-portal`

| Script | Command |
| --- | --- |
| `dev` | `next dev --port 3002` |
| `build` | `next build` |
| `start` | `next start --port 3002` |
| `lint` | `eslint` |
| `seed` | `tsx scripts/seed.ts` |
| `seed:test` | `tsx scripts/seed-test-client.ts` |
| `upsert:jschibelli` | `tsx scripts/upsert-jschibelli-portal.ts` |
| `db:apply-schema` | `tsx scripts/apply-portal-schema-postgres.ts` |
| `db:link` | `pnpm exec supabase link --project-ref wvjwibsomjecolcigjgr` |
| `db:push` / `db:pull` | Supabase CLI |
| `hubspot:ensure-co-properties` | `tsx scripts/hubspot/ensure-change-order-properties.ts` |
| `hubspot:ensure-subscription-deal-properties` | `tsx scripts/hubspot/ensure-subscription-deal-properties.ts` |
| `hubspot:ensure-co-form` | `tsx scripts/hubspot/ensure-change-order-form.ts` |
| `hubspot:update-co-form` | `tsx scripts/hubspot/update-change-order-form.ts` |
| `stripe:setup-maintenance-products` | `tsx scripts/setup-maintenance-products.ts` |
| `test` | `tsx --test src/lib/webhooks/provision-client-idempotency.test.ts` |
| `verify:stack` | `tsx scripts/verify-stack-alignment.ts` |
| `vercel:align-env` | `tsx scripts/vercel-align-env.ts` |
| `vercel:prune-dev-env` | `tsx scripts/vercel-prune-dev-env.ts` |

**Ad-hoc scripts (not in `package.json` scripts):** `scripts/update-payment-links.js`, `scripts/test-n8n-add-invoice.ts`, `scripts/verify-stripe-subscription-sync.ts`, `scripts/vercel-kv-list.ts`, `scripts/cleanup-verify-subscriptions.ts`, `scripts/lib/*`, `scripts/hubspot/change-order-form-fields.ts`.

### `@repo/iw-site-q2`

| Script | Command |
| --- | --- |
| `dev` | `next dev --port 3010` |
| `build` | `next build` |
| `start` | `next start --port 3010` |
| `lint` | `eslint` |

### `@repo/n8n-workflows`

| Script | Command |
| --- | --- |
| `build` | Creates `dist/.gitkeep` |
| `lint` | no-op exit 0 |
| `check-types` | no-op exit 0 |
| `pull:n8n` | `node scripts/pull-from-n8n.mjs` |
| `sync:n8n:package` | `node scripts/sync-from-n8n-to-package.mjs` |
| `inject:send-email-prepare` | inject code node (long path) |
| `push:n8n:workflow` | `node scripts/push-local-workflow.mjs` |

### `@repo/eslint-config` / `@repo/typescript-config`

No runnable scripts (config-only packages).

## 4. Known external integrations

| Integration | Where used |
| --- | --- |
| Clerk | `iw-portal` (auth, webhooks, JWT template for Supabase) |
| Supabase | `iw-portal` (client/server helpers, Postgres-backed portal data) |
| Stripe | `iw-portal` (checkout, webhooks, maintenance products) |
| Resend | `iw-portal`, `iw-site-q2` (email) |
| HubSpot | `iw-portal` (CRM, forms, deal sync, scripts); `iw-site-q2` (contacts, deals, form submission paths) |
| n8n | `iw-portal` (outbound HTTP to n8n, inbound webhook); `iw-site-q2` (contact / intake / kickoff webhooks); `packages/n8n-workflows` (API sync) |
| Cal.com | `iw-site-q2` (embed, API for kickoff booking) |
| reCAPTCHA Enterprise | `iw-site-q2` (contact + website intake) |
| Anthropic | `iw-site-q2` (contact flow) |
| Vercel | Hosting assumption for both Next apps; `iw-portal` scripts `vercel-align-env`, `vercel-prune-dev-env` |
| Google Drive | **Not** directly in app TypeScript SDKs; appears in **n8n workflows** (e.g. Google Drive nodes, `client_drive_folder_id` in sample payloads). |

## 5. Environment variable inventory

**Sources:** [turbo.json](../../turbo.json) (`globalEnv`, `globalPassThroughEnv`, `tasks.build.env`), `grep` of `process.env.*` in apps and n8n scripts.

### Turborepo / global pass-through (secrets and tooling)

Listed in `globalPassThroughEnv`: `N8N_API_KEY`, `N8N_API_URL`, `N8N_MCP_JSON`, `N8N_BASE_URL`, `N8N_WEBHOOK_SECRET`, `WEBHOOK_SECRET`, `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_TOKEN`, `HUBSPOT_PRIVATE_APP_TOKEN`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`.

`globalEnv`: `NODE_ENV`, `CI`.

`tasks.build.env`: see [environment-contract.md](./environment-contract.md) for the full allowlist (NEXT_PUBLIC_*, Postgres, Supabase, reCAPTCHA, Stripe webhook, etc.).

### `apps/iw-portal` (code references)

Clerk: `NEXT_PUBLIC_CLERK_*` (publishable key, domain, satellite, proxy, sign-in/up URLs, `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY`), `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_SUPABASE_JWT_TEMPLATE`.

Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`.

Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MAINTENANCE_PACKAGES`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (in turbo build env).

HubSpot: `HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_TOKEN`, `HUBSPOT_PORTAL_ID`, `NEXT_PUBLIC_HUBSPOT_ID`, `HUBSPOT_FORM_GUID`, `HUBSPOT_CHANGE_ORDER_FORM_GUID`, `HUBSPOT_DEAL_PORTAL_PLAN_PROPERTY`, `HUBSPOT_CRM_MIRROR`, test/override IDs (`HUBSPOT_TEST_*`, `HUBSPOT_JSCHIBELLI_*`, `VERIFY_HUBSPOT_DEAL_ID`).

n8n: `N8N_BASE_URL`, `WEBHOOK_SECRET`, `PORTAL_PROPOSAL_LIFECYCLE_WEBHOOKS_ENABLED`.

Email: `RESEND_API_KEY`, `STAFF_EMAIL`, `STAFF_EMAILS`, `STAFF_DISPLAY_NAME`, `EMAIL_LOGO_URL`, `EMAIL_LOGO_DARK_URL`, `NEXT_PUBLIC_EMAIL_LOGO_URL`, `NEXT_PUBLIC_EMAIL_LOGO_DARK_URL`.

App URLs: `NEXT_PUBLIC_APP_URL`, `VERCEL_URL`.

Portal behavior: `PORTAL_AUTO_PROVISION_SIGNUPS`, `VERIFY_PROJECT_SLUG`.

Postgres / scripts: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_HOST`, `NODE_TLS_REJECT_UNAUTHORIZED`, `PORTAL_APPLY_NOTES_DEMO`.

Vercel scripts: `VERCEL_ALIGN_PRODUCTION_ONLY`, `VERCEL_SYNC_PREVIEW_GIT_BRANCHES`.

Misc: `NODE_ENV`, `ANALYZE` (turbo).

### `apps/iw-site-q2` (code references)

Resend / contact: `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_BYPASS_RECAPTCHA_SECRET`, `CONTACT_INSECURE_SKIP_RECAPTCHA`, `CONTACT_INTEGRATION_DEBUG`, `ANTHROPIC_API_KEY`.

reCAPTCHA: `RECAPTCHA_ENTERPRISE_PROJECT_ID`, `RECAPTCHA_ENTERPRISE_SITE_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `GOOGLE_APPLICATION_CREDENTIALS` (set temporarily at runtime), `RECAPTCHA_SKIP_IN_DEV`, `RECAPTCHA_MIN_SCORE`, `RECAPTCHA_DEBUG_RESPONSE`.

HubSpot: `NEXT_PUBLIC_HUBSPOT_ID`, `HUBSPOT_FORM_GUID`, `HUBSPOT_ACCESS_TOKEN`, plus deal/contact property overrides (`HUBSPOT_DEAL_PIPELINE_ID`, `HUBSPOT_DEAL_STAGE_LEAD_QUALIFIED`, `HUBSPOT_DEAL_OWNER_ID`, `HUBSPOT_WEBSITE_INTAKE_*`, kickoff property names in `lib/hubspotKickoffBooking.ts`, `lib/hubspotCreateOrUpdateContact.ts`, `lib/hubspotCreateWebsiteIntakeDeal.ts`).

n8n: `N8N_CONTACT_WEBHOOK_URL`, `N8N_KICKOFF_BOOKED_WEBHOOK_URL`, `N8N_CONTACT_DEAL_STAGE`, `N8N_WEBHOOK_TIMEOUT_MS`, `WEBSITE_INTAKE_STRICT_N8N`, `MARKETING_N8N_WEBHOOK_SECRET`, `N8N_WEBHOOK_SECRET`, `MARKETING_N8N_WEBHOOK_SECRET_HEADER`, `N8N_WEBHOOK_SECRET_HEADER`, `WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET`, `WEBSITE_INTAKE_DEBUG_UPSTREAM`.

Cal.com: `CAL_API_KEY`, `CAL_API_BASE`, `CAL_ORGANIZATION_SLUG`, `CAL_EVENT_TYPE_ID`, `NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK`, `CAL_BOOKING_MANAGE_URL_BASE`.

Kickoff JWT: `KICKOFF_BOOKING_JWT_SECRET`, `KICKOFF_BOOKING_JWT_TTL_SEC`.

Site URLs: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SCHEDULE_URL`, `NEXT_PUBLIC_ACCOUNTS_URL`, `NEXT_PUBLIC_GA_ID` (turbo).

### `packages/n8n-workflows` (scripts)

`N8N_API_KEY`, `N8N_API_URL` or `N8N_BASE_URL`, `N8N_WORKFLOWS_PROJECT_ID`, `N8N_WORKFLOWS_RE_PUBLISH`. Scripts also load `.env.local` from repo root, `apps/iw-portal`, and **`apps/iw-site`** (legacy path) for local runs — confirm on disk when debugging env loading.

## 6. API routes and webhook routes

### `iw-portal` (`src/app/api/**/route.ts`)

| Route area | Path pattern |
| --- | --- |
| Health | `/api/health` |
| Webhooks | `/api/webhook/clerk`, `/api/webhook/stripe`, `/api/webhook/hubspot`, `/api/webhook/n8n` |
| Billing | `/api/billing/create-checkout-session`, `create-balance-checkout`, `create-maintenance-checkout`, `customer-portal`, `payment-method`, `invoices/[invoiceId]/pdf` |
| Change orders | `/api/change-orders`, `/api/change-orders/[id]/cancel`, `/api/change-orders/[id]/pdf` |
| Documents | `/api/documents/upload`, `upload/confirm`, `download`, `sign`, `/api/document-request` |
| Proposals / milestones / messages | `/api/proposals/decision`, `/api/milestones/approve`, `/api/messages` |
| Maintenance | `/api/maintenance/subscribe` |
| Internal OS | `/api/internal/os/contracts-queue`, `automation-log`, `pre-call-intake`, `deal/[dealId]`, `stripe/subscription-sync` |

### `iw-site-q2` (`app/api/**/route.ts`)

| Path |
| --- |
| `/api/contact` |
| `/api/website-intake` |
| `/api/kickoff/book` |
| `/api/kickoff/slots` |

## 7. Supabase / database touchpoints

- **Client:** `apps/iw-portal/src/lib/supabase/client.ts`, `url.ts`
- **Server (Clerk JWT + service role):** `apps/iw-portal/src/lib/supabase/server.ts`
- **Scripts:** `apps/iw-portal/scripts/lib/supabase-env.ts`, `apply-portal-schema-postgres.ts`, `seed.ts`, `seed-test-client.ts`
- **Usage:** Most portal API routes and server actions that persist portal state; types under `src/lib/supabase/types` (if present)
- **CLI:** `supabase` devDependency; `db:link` / `db:push` / `db:pull` in portal `package.json`

**Unknown:** Full canonical schema documentation in-repo vs Supabase dashboard only — confirm via `supabase/migrations` or linked project.

## 8. Stripe touchpoints

- `apps/iw-portal/src/lib/stripe/server.ts`, `maintenance-packages.ts`, catalog/checkout helpers
- `apps/iw-portal/src/app/api/webhook/stripe/route.ts`
- `apps/iw-portal/src/app/api/billing/*`
- Scripts: `scripts/setup-maintenance-products.ts`, `scripts/update-payment-links.js`, `scripts/verify-stripe-subscription-sync.ts`

## 9. HubSpot touchpoints

- `apps/iw-portal/src/lib/hubspot/*`, `src/lib/integrations/hubspot-crm-mirror.ts`
- `apps/iw-portal/src/app/api/webhook/hubspot/route.ts`
- `apps/iw-portal/scripts/hubspot/*`
- `apps/iw-site-q2/lib/hubspot*.ts`, `app/api/contact/route.ts`, `app/api/website-intake/route.ts`, `app/api/kickoff/book/route.ts`

## 10. Resend / email touchpoints

- `apps/iw-portal/src/lib/email/*` (send, templates, design-tokens)
- `apps/iw-site-q2` contact route and email shell helpers

## 11. Clerk / auth touchpoints

- `apps/iw-portal` middleware and Clerk Next.js integration (see `src/lib/clerk-satellite.ts`, layout, `(portal)` routes)
- `apps/iw-portal/src/app/api/webhook/clerk/route.ts` (Svix verification)
- Scripts using `CLERK_SECRET_KEY`: `seed-test-client.ts`, `upsert-jschibelli-portal.ts`

## 12. n8n workflow touchpoints

- **Docs:** `apps/iw-portal/docs/n8n-integration.md`
- **Portal code:** `src/lib/n8n/*`, `src/app/api/webhook/n8n/route.ts`, outbound triggers in `src/lib/n8n/client.ts`
- **Marketing site:** webhook URLs in contact / intake / kickoff routes
- **Package:** `packages/n8n-workflows` JSON, `RUNBOOK.md`, `STAGES.md`, scripts under `scripts/`

## 13. Known legacy / deprecated paths

- **`apps/iw-site`:** excluded from `pnpm-workspace.yaml`; contains deprecated n8n script wrappers and legacy marketing code. Do not treat as active workspace package.
- **`apps/iw-portal/src/proxy.ts`:** references `LEGACY_PORTAL_HOST` (`portal.intrawebtech.com`) for redirect behavior.
- **HubSpot tokens:** code comments note `HUBSPOT_TOKEN` as legacy alias alongside `HUBSPOT_ACCESS_TOKEN` / private app token.
- **n8n:** `packages/n8n-workflows/RUNBOOK.md` documents retirement of legacy `apps/iw-site/scripts/*n8n*` entry points.

## 14. Current build / lint / typecheck commands

| Command | Behavior |
| --- | --- |
| `pnpm install` | Root install |
| `pnpm build` | `turbo run build` (all packages with `build` script) |
| `pnpm lint` | `turbo run lint` |
| `pnpm check-types` | `turbo run check-types` — **only `@repo/n8n-workflows` defines `check-types` today** (no-op). Next.js apps do not declare `check-types`; types are checked indirectly via `next build`. |
| Filtered app build | `pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2` |

**Portal tests:** `pnpm --filter @repo/iw-portal test` runs `provision-client-idempotency.test.ts`.

## 15. Risks and unknowns

| Topic | Risk / unknown |
| --- | --- |
| Turbo `envMode: strict` | Build cache misses or empty env at build time if a variable is used but not listed in `turbo.json` for the task. |
| `NEXTAUTH_SECRET` | Listed in turbo pass-through; **no grep hits** in active apps — may be unused or reserved; confirm before removal. |
| `DATABASE_URL` | Pass-through in turbo; portal scripts prefer `POSTGRES_*` — confirm single source of truth for local vs Vercel. |
| HubSpot token variants | Three names (`HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_TOKEN`) — deployment must supply the one expected per code path. |
| Google Drive | Integration lives in n8n credentials, not in repo env docs for apps; credential rotation is an ops concern on n8n. |
| Production URLs / webhook URLs | Exact production URLs for Clerk/Stripe/n8n endpoints are configured in provider dashboards; not fully duplicated in this inventory. |
| Cal.com / Anthropic keys | Required for full marketing flows; scope of “required for build” vs runtime only should be validated per Vercel project. |
