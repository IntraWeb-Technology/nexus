# Environment contract

This document lists variables **as named in code and Turborepo config** — no renames. For discovery sources, see [architecture-inventory.md](./architecture-inventory.md).

**Legend:** “Build” = Next.js `turbo run build` task env allowlist in [turbo.json](../../turbo.json). “Pass-through” = `globalPassThroughEnv` (available to tasks without listing every key on `build.env` for secrets tooling).

## Global / Turborepo

| Variable | Scope | Public/Secret | Required for build | Required at runtime | Current known usage |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | global | Public | Yes (implicit) | Yes | Standard Node/Next |
| `CI` | global | Public | Optional | Optional | CI detection |
| `N8N_API_KEY` | pass-through | Secret | No | Yes (scripts) | n8n API scripts |
| `N8N_API_URL` | pass-through | Secret | No | Yes (scripts) | n8n API base URL |
| `N8N_MCP_JSON` | pass-through | Secret | Unknown | Unknown | MCP / tooling; confirm consumers |
| `N8N_BASE_URL` | pass-through, portal | Secret/Public | Build list / pass-through | Yes | Portal n8n client default URL |
| `N8N_WEBHOOK_SECRET` | pass-through | Secret | No | Yes (marketing alt) | Marketing webhook HMAC (with `MARKETING_*` variants) |
| `WEBHOOK_SECRET` | pass-through, portal | Secret | Build list | Yes | Portal inbound n8n/HubSpot shared header; outbound signing |
| `HUBSPOT_ACCESS_TOKEN` | pass-through, both apps | Secret | Build list | Yes | APIs and forms |
| `HUBSPOT_TOKEN` | pass-through | Secret | No | Yes (alias) | Legacy alias for HubSpot token |
| `HUBSPOT_PRIVATE_APP_TOKEN` | pass-through, portal | Secret | No | Yes | Portal scripts and stack verify |
| `CLERK_SECRET_KEY` | pass-through | Secret | No | Yes | Portal server Clerk |
| `STRIPE_SECRET_KEY` | pass-through | Secret | No | Yes | Portal Stripe server |
| `SUPABASE_SERVICE_ROLE_KEY` | pass-through | Secret | No | Yes | Portal service Supabase |
| `RESEND_API_KEY` | pass-through | Secret | Build list | Yes | Email |
| `DATABASE_URL` | pass-through | Secret | No | Unknown | Listed in turbo; portal uses `POSTGRES_*` heavily — confirm |
| `NEXTAUTH_SECRET` | pass-through | Secret | No | Unknown | Listed; **no hits in active apps** — verify before use |

Additional keys on **`tasks.build.env`** in `turbo.json` (subset; full list in repo): `NEXT_PUBLIC_*` for Clerk, Supabase, Stripe, HubSpot, reCAPTCHA, Cal, GA, app URLs; `POSTGRES_*`; `SUPABASE_*`; `STRIPE_WEBHOOK_SECRET`; `RECAPTCHA_*`; `WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET`; `KICKOFF_BOOKING_JWT_SECRET`; `CLERK_WEBHOOK_SECRET`; `STACK_SECRET_SERVER_KEY`; `NEON_PROJECT_ID`; `STAFF_EMAIL`; `ANALYZE`; `DEBUG_PROMPTS`; `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

## `apps/iw-portal`

| Variable | Public/Secret | Required for build | Required at runtime | Current known usage |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public | Yes (turbo) | Yes | Client Clerk |
| `NEXT_PUBLIC_CLERK_DOMAIN` | Public | Yes | Yes | Satellite domain |
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | Public | Yes | Yes | Satellite mode |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | Public | Yes | Yes | Auth proxy |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Public | Yes | Yes | Auth URLs |
| `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY` | Public | Not on turbo list | Yes | Clerk satellite FAPI |
| `NEXT_PUBLIC_APP_URL` | Public | Yes | Yes | Links, redirects |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | Yes | Browser Supabase |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Yes | Yes | Checkout |
| `NEXT_PUBLIC_HUBSPOT_ID` | Public | Yes | Yes | Hub ID |
| `NEXT_PUBLIC_EMAIL_LOGO_URL` / `NEXT_PUBLIC_EMAIL_LOGO_DARK_URL` | Public | Yes | Optional | Email assets |
| `CLERK_WEBHOOK_SECRET` | Secret | Yes | Yes | Svix webhook |
| `CLERK_SUPABASE_JWT_TEMPLATE` | Secret | No | Yes | Default `supabase` |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Secret/server | Yes | Yes | Server fallbacks |
| `SUPABASE_SECRET_KEY` | Secret | Yes | Yes | Alias for service role |
| `STRIPE_WEBHOOK_SECRET` | Secret | Yes | Yes | Stripe webhook |
| `STRIPE_MAINTENANCE_PACKAGES` | Secret | No | Optional | JSON config for maintenance |
| `HUBSPOT_*` (portal-specific) | Mixed | Partial | Varies | See inventory |
| `RESEND_API_KEY` | Secret | Yes | Yes | Email |
| `STAFF_EMAIL` / `STAFF_EMAILS` / `STAFF_DISPLAY_NAME` | Secret / Public | Yes / No | Optional | Admin + help |
| `N8N_BASE_URL` | Secret | No | Optional | Defaults to production host in code |
| `WEBHOOK_SECRET` | Secret | Yes | Yes | Intraweb header |
| `PORTAL_AUTO_PROVISION_SIGNUPS` | Secret | No | Optional | Feature flag |
| `PORTAL_PROPOSAL_LIFECYCLE_WEBHOOKS_ENABLED` | Secret | No | Optional | n8n proposal hooks |
| `HUBSPOT_CRM_MIRROR` | Secret | No | Optional | CRM mirror mode |
| `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` / `POSTGRES_HOST` | Secret | Yes | Scripts/DB | Migrations / verify |
| `VERCEL_URL` | Public | No | Optional | URL fallback |

### `@repo/env` in portal scripts (non-runtime)

These **tsx scripts** call `validateIwPortalEnv` from `@repo/env` after any `dotenv` load (where applicable). App routes and React code do **not** import `@repo/env` yet.

| Script | Default `IW_PORTAL_ENV_VALIDATE` behavior |
| --- | --- |
| `scripts/verify-stack-alignment.ts` | **strict** — invalid portal env shape exits before checks |
| `scripts/vercel-align-env.ts` | **report** — print issues, still run Vercel sync |
| `scripts/vercel-prune-dev-env.ts` | **off** — no `.env.local`; opt in with `report` or `strict` |

Override: set `IW_PORTAL_ENV_VALIDATE` to `strict`, `report`, or `0` / `off` / `false`.

## `apps/iw-site-q2`

| Variable | Public/Secret | Required for build | Required at runtime | Current known usage |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Not all on turbo | Yes | Email shell |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public | Yes | Yes | Client reCAPTCHA |
| `NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK` | Public | Yes | Yes | Cal embed |
| `NEXT_PUBLIC_HUBSPOT_ID` | Public | Yes | Yes | Forms |
| `NEXT_PUBLIC_SCHEDULE_URL` / `NEXT_PUBLIC_ACCOUNTS_URL` | Public | Yes | Yes | Footer links |
| `NEXT_PUBLIC_GA_ID` | Public | Yes | Optional | Analytics |
| `RECAPTCHA_ENTERPRISE_PROJECT_ID` / `RECAPTCHA_ENTERPRISE_SITE_KEY` | Secret | Yes | Yes | Server verification |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Secret | Yes | Yes | GCP creds for Enterprise API |
| `RECAPTCHA_SKIP_IN_DEV` | Secret | Yes | Dev only | Bypass |
| `RESEND_API_KEY` | Secret | Yes | Yes | Contact email |
| `CONTACT_EMAIL` | Secret | No | Yes | Recipient |
| `HUBSPOT_ACCESS_TOKEN` / `HUBSPOT_FORM_GUID` | Secret | Yes | Yes | CRM |
| `N8N_CONTACT_WEBHOOK_URL` / `N8N_KICKOFF_BOOKED_WEBHOOK_URL` | Secret | Yes | Optional | Automation |
| `MARKETING_N8N_WEBHOOK_SECRET` / `N8N_WEBHOOK_SECRET` | Secret | No | Yes | HMAC |
| `MARKETING_N8N_WEBHOOK_SECRET_HEADER` / `N8N_WEBHOOK_SECRET_HEADER` | Secret | No | Optional | Custom header names |
| `CAL_API_KEY` / `CAL_ORGANIZATION_SLUG` / `CAL_EVENT_TYPE_ID` | Secret | No | Yes | Kickoff API |
| `CAL_API_BASE` / `CAL_BOOKING_MANAGE_URL_BASE` | Secret | No | Optional | Defaults in code |
| `KICKOFF_BOOKING_JWT_SECRET` / `KICKOFF_BOOKING_JWT_TTL_SEC` | Secret | Yes | Yes | Session JWT |
| `ANTHROPIC_API_KEY` | Secret | No | Optional | Contact AI path |
| `WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET` | Secret | Yes | Optional | Test/bypass |
| Many `HUBSPOT_*` overrides | Secret | No | Optional | Pipelines, properties — see inventory |

## `packages/n8n-workflows`

| Variable | Public/Secret | Required for build | Required at runtime | Current known usage |
| --- | --- | --- | --- | --- |
| `N8N_API_KEY` | Secret | No | Yes | push/pull/sync |
| `N8N_API_URL` or `N8N_BASE_URL` | Secret | No | Yes | API host |
| `N8N_WORKFLOWS_PROJECT_ID` | Secret | No | Yes | Project scoping in scripts |
| `N8N_WORKFLOWS_RE_PUBLISH` | Secret | No | Optional | Push behavior |

## Unknown / unassigned

| Variable | Note |
| --- | --- |
| `N8N_MCP_JSON` | Purpose not traced in app code; likely editor/MCP tooling. |
| `NEXTAUTH_SECRET` | Present in turbo; no usage in `iw-portal` / `iw-site-q2` source grep. |
| `DATABASE_URL` | Pass-through; portal prefers `POSTGRES_URL` — confirm whether any dependency uses `DATABASE_URL` on Vercel. |
| `STACK_SECRET_SERVER_KEY` | On turbo build list; confirm product (e.g. Neon Stack) usage in app. |
