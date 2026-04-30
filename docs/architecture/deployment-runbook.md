# Deployment runbook

## GitHub Actions CI

Repository: [IntraWeb-Technology/nexus](https://github.com/IntraWeb-Technology/nexus).

Workflow file: `.github/workflows/ci.yml` (job `ci`).

| Item | Value |
|------|--------|
| Triggers | `push` and `pull_request` to `main` and `development` |
| Runner | `ubuntu-latest` |
| Node.js | 22 |
| Package manager | pnpm **10.33.0** via **Corepack** (`corepack enable` then `corepack prepare pnpm@10.33.0 --activate`) |
| Cache | pnpm store restored with `actions/cache`, keyed by OS and hash of root `pnpm-lock.yaml` |

Steps run in order:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm check-types`
4. `pnpm build`

This workflow validates the monorepo only; it does not deploy or call hosting APIs. Deployment steps belong in separate automation if you add them later.

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
- Environment variables set per project to match [environment-contract.md](./environment-contract.md).
- `turbo.json` uses `envMode: strict` — any env var read at build time should appear on the `build` task `env` list or `globalPassThroughEnv` where applicable, or builds may not see values when cached.

## Environment variable requirements

1. Copy/fill `.env.local` per app (not committed). n8n scripts may also read root and `apps/iw-portal/.env.local` (and legacy `apps/iw-site/.env.local` in some scripts).
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

## Related docs

- [webhook-contracts.md](./webhook-contracts.md)
- [apps/iw-portal/docs/n8n-integration.md](../../apps/iw-portal/docs/n8n-integration.md)
- [packages/n8n-workflows/RUNBOOK.md](../../packages/n8n-workflows/RUNBOOK.md)
