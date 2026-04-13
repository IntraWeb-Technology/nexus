# iw-portal

IntraWeb OS client portal — multi-tenant project portal for IntraWeb clients.

## Monorepo

Package name: **`@repo/iw-portal`**, path: **`apps/iw-portal`**.

- **Dev (from repo root):** `pnpm --filter @repo/iw-portal dev`
- **Build (from repo root):** `pnpm exec turbo run build --filter=@repo/iw-portal`

## Vercel

1. **Root Directory:** `apps/iw-portal`
2. Turn on **Include files outside the root directory in the Build Step** (pnpm workspace + root lockfile).
3. Leave the default install/build override empty if you rely on `vercel.json` in this folder (`cd ../..` then `pnpm install` + `turbo build`).

Environment variables for Clerk, Supabase, Stripe, etc. are documented in the repo root `.env.example` under the Portal section.
