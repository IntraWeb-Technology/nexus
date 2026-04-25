# Nexus Monorepo

Nexus is the IntraWeb Technologies pnpm + Turborepo monorepo for the client portal, marketing site, n8n workflow assets, and shared build configuration.

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

## Workspace Notes

- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`, with `apps/iw-site` excluded.
- Turborepo uses `envMode: strict`; add build-time environment variables to `turbo.json` when app code reads them during build.
- `@/` path aliases differ by app:
  - `apps/iw-portal`: `@/*` resolves to `src/*`.
  - `apps/iw-site-q2`: `@/*` resolves to the app root.

## Deployment

The active Next.js apps are deployed through Vercel. Required service integrations include Clerk, Supabase, Stripe, Resend, HubSpot, n8n, Cal.com, Google reCAPTCHA Enterprise, and Anthropic.
