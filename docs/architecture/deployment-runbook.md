# Deployment runbook

## GitHub Actions CI

Repository: [IntraWeb-Technology/nexus](https://github.com/IntraWeb-Technology/nexus).

Workflow files:

| Workflow | Purpose |
|----------|---------|
| `.github/workflows/ci.yml` | Affected lint / typecheck / test / build + **CI Gate** |
| `.github/workflows/deploy.yml` | Affected Strapi Docker build (Hostinger apply optional) |

| Item | Value |
|------|--------|
| Triggers (CI) | `push` / `pull_request` to `main` and `development`; `workflow_dispatch` (`force_all`, `skip_turbo_cache`) |
| Triggers (Deploy) | `push` to `main`; `workflow_dispatch` (`force_all`, `app`, `force_deploy`) |
| Runner | `ubuntu-latest` |
| Node.js | 22 |
| Package manager | pnpm **10.33.0** via **Corepack** |
| Cache | pnpm store + Turborepo `.turbo` (CI validate job) |
| Change detection | `.github/scripts/affected.mjs` → `turbo query affected` (fail closed) |
| Checkout | `fetch-depth: 0` (required for accurate affected ranges) |

CI jobs:

1. **Detect affected** — resolve base/head SHAs, emit package/app summary
2. **Validate** — `turbo run lint check-types test build --filter=...[BASE]` (or full workspace on `force_all` / detection failure)
3. **CI Gate** — always runs; required status check should point here

Next.js production deploys remain on **Vercel** (`ignoreCommand` + `turbo query affected` per app). See [ci-affected.md](./ci-affected.md).

## Local development

From repo root:

```sh
pnpm install
pnpm --filter @repo/iw-portal dev
pnpm --filter @repo/iw-site-q2 dev
```

Ports: portal **3002**, marketing **3010** (see each app’s `package.json`).

Optional: `pnpm dev` runs all workspace `dev` tasks via Turborepo.

## Build

All packages that define `build`:

```sh
pnpm build
```

Production apps only:

```sh
pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2
```

## Lint and typecheck

```sh
pnpm lint
pnpm check-types
```

**Note:** Today only `@repo/n8n-workflows` declares `check-types` (no-op). Next.js apps typecheck during `next build`. See [architecture-inventory.md](./architecture-inventory.md).

## Vercel assumptions

- Two projects (or one monorepo with two app roots) for `iw-portal` and `iw-site-q2`.
- For **`nexus-iw-portal`**, the dashboard setting **Include files outside the root directory** must be enabled so `apps/iw-portal/vercel.json` can `cd ../..` and run the monorepo `pnpm install` / `turbo` build.
- **`nexua-atlas-docs`** (Vercel project for `apps/atlas-docs`): Root Directory must be `apps/atlas-docs`. This app is **Yarn 4**, excluded from the pnpm workspace. Do **not** use `pnpm install` — Vercel’s Turbo detection would pick the repo-root lockfile and fall back to pnpm 6 (`ERR_INVALID_THIS` on Node 24). [`apps/atlas-docs/vercel.json`](../../apps/atlas-docs/vercel.json) runs the vendored Yarn 4 binary (`yarn install --immutable` / `yarn build`). Node **24.x** matches `apps/atlas-docs/.nvmrc`.
- Environment variables set per project to match [environment-contract.md](./environment-contract.md).
- `turbo.json` uses `envMode: strict` — any env var read at build time should appear on the `build` task `env` list or `globalPassThroughEnv` where applicable, or builds may not see values when cached.

## Environment variable requirements

1. Copy/fill `.env.local` per app (not committed). n8n scripts may also read root, `apps/iw-portal/.env.local`, and `apps/iw-site-q2/.env.local`.
2. Align production secrets with [integration-map.md](./integration-map.md).
3. After changing turbo env lists, validate a clean `pnpm build` so caches are not stale with wrong env.

## Pre-deploy checklist

- [ ] Confirm Vercel env vars for the target branch (production vs preview).
- [ ] Clerk authorized redirect URLs and satellite/proxy URLs match dashboard URLs.
- [ ] Stripe webhook endpoint URL and signing secret match the deployment.
- [ ] HubSpot private app or access token valid; form GUIDs match fields.
- [ ] n8n inbound URLs point to correct deployment host; `WEBHOOK_SECRET` matches portal and workflow config.
- [ ] Supabase keys and Postgres connectivity for portal.
- [ ] reCAPTCHA Enterprise credentials for marketing site if forms are live.

## Post-deploy smoke tests

**Portal**

- [ ] Load sign-in page and complete login (Clerk).
- [ ] Open `/api/health` and confirm JSON indicates configured keys (without leaking secrets).
- [ ] Billing: open customer portal or checkout test mode path as appropriate.

**Marketing**

- [ ] Home and contact page load; reCAPTCHA widget loads (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`).
- [ ] Submit contact form in staging with test data (respect bypass secrets policy).
- [ ] Website intake flow if enabled.

**Automations**

- [ ] Trigger a safe test webhook or use n8n “test workflow” toward staging portal URL if available.

## Rollback and release candidates (Phase 10)

### Last known good (LKG) commit

Before tagging (`v0.1.0-rc.1` or similar) or promoting a risky deployment, record the Git SHA you trust:

```sh
git rev-parse HEAD
git log -1 --oneline
```

Store that SHA in the release ticket or a short-lived note next to this runbook. Example recorded during Phase 10 validation: `936019dbb054ebbb51e0bb4a372a2d99df622d45` (`936019d`).

### Revert a bad Vercel deployment

1. Open Vercel → the project (`nexus-iw-portal`, `iw-site-q2`, etc.) → **Deployments**.
2. Locate the last **Ready** deployment for the target environment (Production or Preview).
3. Use the deployment menu (**⋯**) → **Promote to Production** to roll production back to that build, or **Redeploy** pinned to a known-good Git commit.

If your team uses **Vercel Authentication** / SSO on preview URLs, CLI-only checks may return `401`; use the dashboard signed-in session for rollback.

### Roll back environment variable changes

1. Vercel → Project → **Settings** → **Environment Variables**. Restore prior values from your password manager or internal secrets store (the CLI does not version values).
2. Optional sync from a trusted local file (does not commit secrets): `pnpm --filter @repo/iw-portal vercel:align-env` (defaults to **report** in `@repo/ops`; see [environment-contract.md](./environment-contract.md)).
3. After any production env change, **Redeploy** the production deployment so new values are applied.

### Irreversible or out-of-band effects

Redeploying or rolling back the **Next.js app** does not undo:

- **Stripe**: captured charges, refunds, or customer billing state.
- **HubSpot / Supabase / n8n**: CRM rows, Postgres rows, or workflow executions already written by live traffic.

Treat those systems with their own support or data-fix procedures.

### Stack verification before tag

From repo root (requires `apps/iw-portal/.env.local` for local diagnostics):

```sh
pnpm --filter @repo/ops diagnostics:verify-stack
pnpm --filter @repo/iw-portal verify:stack
```

## Self-hosted Supabase (Hostinger VPS)

To migrate off managed `*.supabase.co` to Docker on Hostinger KVM, follow [supabase-self-host-hostinger.md](./supabase-self-host-hostinger.md). Bootstrap script: `apps/iw-portal/scripts/self-host/bootstrap-supabase-vps.sh`.

## Related docs

- [supabase-self-host-hostinger.md](./supabase-self-host-hostinger.md)
- [webhook-contracts.md](./webhook-contracts.md)
- [apps/iw-portal/docs/n8n-integration.md](../../apps/iw-portal/docs/n8n-integration.md)
- [packages/n8n-workflows/RUNBOOK.md](../../packages/n8n-workflows/RUNBOOK.md)
