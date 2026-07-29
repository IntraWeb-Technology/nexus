# Nexus Monorepo — Agent Guide

pnpm + Turborepo monorepo. See `README.md` for the canonical setup/dev/build/test/lint commands and app overview. Node `22.x`, pnpm `10.33.0` (already provisioned in Cursor Cloud).

## Cursor Cloud specific instructions

The update script runs `pnpm install`. After that, everything below works with no extra setup.

### Services (both boot with zero secrets)

| App | Package | Dev command | Port | Notes |
| --- | --- | --- | --- | --- |
| Marketing site | `@repo/iw-site-q2` | `pnpm --filter @repo/iw-site-q2 dev` | 3010 | Fully functional locally. Homepage and all pages serve without any `.env.local`. |
| Client portal | `@repo/iw-portal` | `pnpm --filter @repo/iw-portal dev` | 3002 | Server-side works with no secrets (routes, `src/proxy.ts` Clerk middleware, `/api/health`). Uses Clerk keyless dev mode. |

Standard `pnpm lint`, `pnpm check-types`, `pnpm build` run from the repo root (Turborepo). Both pass with no env vars.

### Non-obvious caveats

- **`iw-site-q2` test script lacks `tsx`.** `pnpm --filter @repo/iw-site-q2 test` fails with `tsx: not found` because `tsx` is only a devDependency of `iw-portal`, not `iw-site-q2`. Run its test with the portal's binary instead: from `apps/iw-site-q2`, `../../apps/iw-portal/node_modules/.bin/tsx --test lib/data-deletion.test.ts`. The portal's own `pnpm --filter @repo/iw-portal test` works normally.

- **Marketing contact form returns a graceful 503 without email creds.** Submitting `/contact` validates client-side, hits `POST /api/contact`, and (with no `RESEND_API_KEY`) responds with the notice "Email delivery is not configured. Please reach us at contact@intrawebtech.com." This is expected behavior, not a bug — the full email send needs `RESEND_API_KEY`.

- **Portal Clerk sign-in widget does NOT render in local dev**, even though the server serves `/sign-in` (200). The client-side Clerk JS is loaded from the keyless instance domain (`<slug>.clerk.accounts.dev`), but the CSP `script-src` in `apps/iw-portal/next.config.js` only allows `'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com` — it does not whitelist `*.clerk.accounts.dev`. So the browser blocks Clerk JS and the page stays on the "IntraWeb OS — Client Portal" loading screen with `failed_to_load_clerk_js` in the console. In production, Clerk JS is served same-origin via the satellite/FAPI proxy, which satisfies `'self'`. To exercise the portal's authenticated UI locally you need real Clerk credentials configured with the same-origin proxy (or temporarily whitelist the Clerk script domain in the CSP) — real Clerk keys alone are not sufficient.

- **Verify the portal server via `GET /api/health`** (unauthenticated; excluded from Clerk middleware). It returns a JSON diagnostic of Clerk/Supabase/HubSpot config state and returns HTTP 503 (`"ok": false`) when those are unconfigured, which is normal in a bare local env.

- **Clerk keyless keys rotate on server restart.** Restarting the portal dev server can re-provision a new keyless instance under `apps/iw-portal/.clerk/.tmp/`; a brand-new instance takes a few seconds to become live on Clerk's side. Hard-reload after the server is fully ready if the client shows a transient Clerk load error.
