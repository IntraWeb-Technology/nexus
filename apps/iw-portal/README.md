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

After changing env vars in the Vercel dashboard, trigger a new deployment (for example push a commit that touches this app) so the build picks up the updated values.

### Production 500 (especially after Clerk key changes)

1. In Vercel → **nexus-iw-portal** → **Settings → Environment Variables**, confirm **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** and **`CLERK_SECRET_KEY`** are both set for **Production** (not only Preview). They must be from the **same** Clerk instance, and both **live** (`pk_live_` / `sk_live_`) or both **test** (`pk_test_` / `sk_test_`). A mixed pair causes server errors.
2. Open **`/api/health`** on your deployment (e.g. `https://portal.intrawebtech.com/api/health`). This route is **excluded from Clerk middleware** so it should return JSON even when other pages 500 — it only describes whether keys look present and consistent (no secret values).
3. Clear site cookies for the portal domain (or use a private window). Old **development** session cookies against **production** keys often break auth until cookies are cleared.

### Infinite redirect (portal ↔ `accounts.*` sign-in)

This happens when sign-in completes on **`accounts.intrawebtech.com`** (Clerk primary / Account Portal) but **`portal.intrawebtech.com`** is not configured as a **satellite** app. The portal never receives a synced session, so every protected page sends you to sign-in again.

1. In the [Clerk Dashboard](https://dashboard.clerk.com/) → your application → **Domains** → **Satellites**, add **`portal.intrawebtech.com`** and complete DNS if Clerk asks for it.
2. On the **primary** host (where `/sign-in` lives — e.g. accounts), allow redirects back to the portal: **`ClerkProvider`** `allowedRedirectOrigins` including `https://portal.intrawebtech.com`, or the equivalent Clerk Dashboard “allowed redirect” settings for your setup ([satellite domains](https://clerk.com/docs/advanced-usage/satellite-domains)).
3. In **Vercel** for **nexus-iw-portal** (Production), set either **all** of the following or **none** (single-host mode uses `/sign-in` on the portal only):

| Variable | Example (production) |
|----------|----------------------|
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | `true` |
| `NEXT_PUBLIC_CLERK_DOMAIN` | `portal.intrawebtech.com` (hostname only, no `https://`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `https://accounts.intrawebtech.com/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `https://accounts.intrawebtech.com/sign-up` |

Redeploy after changing these. Server-side redirects use Clerk’s `redirectToSignIn()` so the return/sync flow matches the middleware configuration.
