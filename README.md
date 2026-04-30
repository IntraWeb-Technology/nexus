# Nexus Monorepo

Nexus is the IntraWeb Technologies pnpm + Turborepo monorepo for the client portal, marketing site, n8n workflow assets, and shared build configuration.

## Vercel (portal)

The **nexus-iw-portal** project must not use the monorepo repository root as Vercel’s **Root Directory** unless you rely on the root [`vercel.json`](./vercel.json) shim (see below).

**Recommended:** In Vercel → Project → **Settings → Build & Deployment → Root Directory**, set **`apps/iw-portal`**, enable **Include files outside the root directory in the Build Step**, and use [`apps/iw-portal/vercel.json`](./apps/iw-portal/vercel.json) for install/build (see [`apps/iw-portal/README.md`](./apps/iw-portal/README.md)).

**If Root Directory is left at `.` (repo root):** Framework detection uses the root `package.json`, which declares **`next`** only so Vercel recognizes a Next.js workspace. The root [`vercel.json`](./vercel.json) runs `turbo` for `@repo/iw-portal`; Next output is auto-detected by the framework preset. Prefer fixing Root Directory to `apps/iw-portal` so a single `vercel.json` under the app stays canonical.

## Active Apps

- `apps/iw-portal` - client dashboard, built with Next.js 16, Clerk, Supabase, Stripe, Resend, and Tailwind CSS v4. Local dev port: `3002`.
- `apps/iw-site-q2` - production marketing site, built with Next.js 16, reCAPTCHA Enterprise, Cal.com, Resend, Anthropic SDK, and Tailwind CSS v4. Local dev port: `3010`.

`apps/iw-site` is the legacy marketing app and is explicitly excluded from the pnpm workspace.

## Packages

- `packages/n8n-workflows` - n8n workflow JSON and sync/push/pull scripts.
- `packages/eslint-config` - shared ESLint configuration.
- `packages/typescript-config` - shared TypeScript configuration.

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

Legacy note: `apps/iw-site/scripts` contains deprecated compatibility wrappers and hard-stops for older n8n commands. Use `packages/n8n-workflows/scripts` as the only source of truth.
Operational runbook: `packages/n8n-workflows/RUNBOOK.md`.

## Workspace Notes

- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`, with `apps/iw-site` excluded.
- Turborepo uses `envMode: strict`; add build-time environment variables to `turbo.json` when app code reads them during build.
- `@/` path aliases differ by app:
  - `apps/iw-portal`: `@/*` resolves to `src/*`.
  - `apps/iw-site-q2`: `@/*` resolves to the app root.

## Deployment

The active Next.js apps are deployed through Vercel. Required service integrations include Clerk, Supabase, Stripe, Resend, HubSpot, n8n, Cal.com, Google reCAPTCHA Enterprise, and Anthropic.
