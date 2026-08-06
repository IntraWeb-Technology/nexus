# Nexus Monorepo

Nexus is the IntraWeb Technologies pnpm + Turborepo monorepo for the client portal, marketing site, n8n workflow assets, and shared build configuration.

## Vercel (monorepo)

There is **no** `vercel.json` at the repository root. Each Next app ships its own file so Vercel never mixes build/output paths between apps.

| App | Vercel **Root Directory** | Config |
| --- | --- | --- |
| Client portal | **`apps/iw-portal`** | [`apps/iw-portal/vercel.json`](./apps/iw-portal/vercel.json) |
| Marketing (`iw-site-q2`) | **`apps/iw-site-q2`** | [`apps/iw-site-q2/vercel.json`](./apps/iw-site-q2/vercel.json) |

For each project, enable **Include files outside the root directory in the Build Step** (pnpm workspace + root lockfile). Details: [`apps/iw-portal/README.md`](./apps/iw-portal/README.md).

**If the portal build succeeds but deploy fails** with `routes-manifest.json` or `.next` under **`apps/iw-site-q2`**, the portal Vercel project’s Root Directory is wrong (often still `apps/iw-site-q2`). Set it to **`apps/iw-portal`** and clear any custom **Output Directory** in project settings.

## Active Apps

- `apps/iw-portal` - client dashboard, built with Next.js 16, Clerk, Supabase, Stripe, Resend, and Tailwind CSS v4. Local dev port: `3002`.
- `apps/iw-site-q2` - production marketing site, built with Next.js 16, reCAPTCHA Enterprise, Cal.com, Resend, Anthropic SDK, and Tailwind CSS v4. Local dev port: `3010`.

Legacy `apps/iw-site` was removed from this monorepo (relocated elsewhere).

## Packages

- `packages/n8n-workflows` - n8n workflow JSON and sync/push/pull scripts.
- `packages/eslint-config` - shared ESLint configuration.
- `packages/typescript-config` - shared TypeScript configuration.

## Documentation

| Area | Path |
| --- | --- |
| Architecture | [`docs/architecture/`](./docs/architecture/) |
| Portal guides | [`docs/portal/`](./docs/portal/) |
| n8n automations | [`docs/automations/`](./docs/automations/) |
| Implementation audit | [`docs/audit/`](./docs/audit/) |
| Portfolio case study (engineering) | [`docs/portfolio/intraweb-platform-case-study.md`](./docs/portfolio/intraweb-platform-case-study.md) |

## Requirements

- Node.js `22.x`
- pnpm `10.33.0`

Install dependencies from the repository root:

```sh
pnpm install
```

## Development

Run all workspace dev tasks:

```sh
pnpm dev
```

Run a single app:

```sh
pnpm --filter @repo/iw-portal dev
pnpm --filter @repo/iw-site-q2 dev
```

## Build and Checks

Build all workspace projects:

```sh
pnpm build
```

Build the production apps:

```sh
pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2
```

Run linting and type checks:

```sh
pnpm lint
pnpm check-types
```

## Useful App Commands

Portal database and stack utilities:

```sh
pnpm --filter @repo/iw-portal db:link
pnpm --filter @repo/iw-portal db:push
pnpm --filter @repo/iw-portal db:pull
pnpm --filter @repo/iw-portal verify:stack
```

n8n workflow sync utilities:

```sh
pnpm --filter @repo/n8n-workflows pull:n8n
pnpm --filter @repo/n8n-workflows sync:n8n:package
pnpm --filter @repo/n8n-workflows push:n8n:workflow
```

Use `packages/n8n-workflows/scripts` as the only source of truth.
Operational runbook: `packages/n8n-workflows/RUNBOOK.md`.

## Workspace Notes

- `pnpm-workspace.yaml` includes `apps/*` and `packages/*` (see file for current excludes).
- Turborepo uses `envMode: strict`; add build-time environment variables to `turbo.json` when app code reads them during build.
- GitHub Actions CI reads remote cache via `TURBO_TOKEN` (repository secret) and `TURBO_TEAM` (repository variable). Create a Vercel access token with Remote Caching scope and set the team slug to match Vercel.
- `@/` path aliases differ by app:
  - `apps/iw-portal`: `@/*` resolves to `src/*`.
  - `apps/iw-site-q2`: `@/*` resolves to the app root.

## Deployment

The active Next.js apps are deployed through Vercel. Required service integrations include Clerk, Supabase, Stripe, Resend, HubSpot, n8n, Cal.com, Google reCAPTCHA Enterprise, and Anthropic.
