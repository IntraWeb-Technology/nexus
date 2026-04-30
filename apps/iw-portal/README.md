# iw-portal

IntraWeb OS client portal — multi-tenant project portal for IntraWeb clients.

## Monorepo

Package name: **`@repo/iw-portal`**, path: **`apps/iw-portal`**.

- **Dev (from repo root):** `pnpm --filter @repo/iw-portal dev`
- **Build (from repo root):** `pnpm exec turbo run build --filter=@repo/iw-portal`

## Vercel

1. **Root Directory:** `apps/iw-portal` (required for a clean setup). If it is left at the **repository root** (`.`), Vercel shows *“No Next.js version detected”* because the root `package.json` normally has no `next` dependency — the monorepo instead adds a root [`vercel.json`](../../vercel.json) shim plus a root **`next`** devDependency so those deployments can still run `turbo` and pick up `apps/iw-portal/.next`. Prefer setting Root Directory here so this folder’s [`vercel.json`](./vercel.json) stays the only source of install/build commands.
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
3. In **Vercel** for **nexus-iw-portal** (Production), set satellite mode **or** leave it off (single-host mode uses `/sign-in` on the app host only):

| Variable | Example (production) |
|----------|----------------------|
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | `true` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | **`https://`…** required — e.g. `https://accounts.intrawebtech.com/sign-in`. If you omit the scheme (`accounts…/sign-in`), the browser treats it as a path on `dashboard.*` / `portal.*` and `redirect_url` grows forever. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Same as sign-in (full URL). The app normalizes missing `https://` at runtime, but fixing env avoids confusion. |
| `NEXT_PUBLIC_CLERK_DOMAIN` | **Optional.** If unset, Clerk uses the **actual browser host** (good when one deployment serves **both** `portal.*` and `dashboard.*`). If set to a single hostname (e.g. `portal.intrawebtech.com`) but users open **`dashboard.intrawebtech.com`**, auth will loop — either **clear** this variable or set it only when you have a single satellite hostname. |
| `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY` | Set to **`true`** if the browser tries to load `https://clerk.dashboard…` / `clerk.portal…` and DNS fails (`ERR_NAME_NOT_RESOLVED`). That URL is Clerk’s default Frontend API host for satellites; without a matching **CNAME**, use a same-origin proxy instead ([proxy for satellite domains](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi#proxying-for-satellite-domains)). When `true`, this app uses **`{current origin}/__clerk/`** and enables `frontendApiProxy` in middleware (do **not** set `NEXT_PUBLIC_CLERK_DOMAIN` together with proxy mode — Clerk treats `proxyUrl` as replacing `domain`). |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | **Optional** override for the proxy (e.g. `https://dashboard.intrawebtech.com/__clerk/`). If set, it wins over `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY`. Configure the same URL in the Clerk Dashboard for the satellite domain if Clerk requires it. |

4. In Clerk → **Configure → Allowed subdomains**, every hostname that loads the app must be listed (`portal`, `dashboard`, `accounts`, …). Typos (e.g. `dasshboard` instead of `dashboard`) cause **403** on `clerk.*` API calls and broken or looping auth.

### Clerk JSON error `host_invalid` (“Invalid host” / publishable key)

Clerk returns this when the **HTTP host** (or **Frontend API proxy URL** host) for the request is **not** registered on the **same** Clerk application as your **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**.

1. **Vercel → Production:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` must be copied from **one** Clerk app, **Production** instance, and both **live** or both **test** (see `/api/health` → `clerk.requestHost` shows the host your edge sees).
2. **Clerk Dashboard → Domains:** Add **`dashboard.intrawebtech.com`** and **`portal.intrawebtech.com`** (and any other origins users hit) as required for your setup — **Frontend** and/or **Satellite** rows must match how you deploy (satellite + proxy means the **proxy URL** Clerk shows for that satellite must match **`NEXT_PUBLIC_CLERK_PROXY_URL`** or your **`…/__clerk/`** path, per [proxy + satellite](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi#proxying-for-satellite-domains)).
3. **Wrong Clerk app:** Keys from app “A” while domains are only on app “B” always produce `host_invalid`.

Redeploy after changing these. Server-side redirects use Clerk’s `redirectToSignIn()` so the return/sync flow matches the middleware configuration.
