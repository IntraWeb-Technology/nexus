# Atlas (`@repo/atlas-web`)

Production frontend for Atlas — the ground-up rebuild of [johnschibelli.dev](https://johnschibelli.dev).

**Current milestone:** M9 Hardening (M9D art-direction slice implemented). Public routes: `/`, `/work`, `/work/[slug]`, `/about`, `/contact`, `/articles`, `/articles/[slug]`, `/docs`, `/docs/[...slug]`.

**Content architecture (v1):** Hybrid. **Articles** and **Documentation** handbook pages are Strapi-managed when CMS mode is active (fail-closed). **Homepage, Work, case studies, About, Contact, and chrome** are always code-managed from committed `src/content/*` and `public/images/*` — Strapi outage must not break those routes. Full-site CMS is deferred. See [`v1-content-architecture.mdx`](../atlas-docs/content/architecture/v1-content-architecture.mdx).

**Content source (CMS surfaces only):** `ATLAS_CONTENT_SOURCE=fixture` for local development, Playwright, and demos. Strapi mode when `ATLAS_CONTENT_SOURCE=strapi` or `STRAPI_URL` is set.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Playwright + axe (e2e / a11y / visual)

## Layout

`@/*` resolves to `./src/*`.

```text
src/
├── app/                 # layout + public routes
├── components/
│   ├── chrome/          # SiteNav, SiteNavActive, SiteFooter, ReadingProgress
│   ├── editorial/       # ChapterMarker, Figure, MetadataRow, Toc, Table, Diagram
│   └── sections/        # page compositions
├── content/             # domain types + fixtures
├── lib/
│   ├── content/         # content loaders (fixture | strapi)
│   └── strapi/          # CMS assemblers (M8)
└── styles/              # tokens + globals
```

Canonical contract: [`apps/atlas-docs/content/architecture/build-manifest.mdx`](../atlas-docs/content/architecture/build-manifest.mdx)

## Development

From the monorepo root:

```sh
pnpm --filter @repo/atlas-web dev
```

Local URL: [http://localhost:3020](http://localhost:3020)

## Scripts

| Script | Command |
| --- | --- |
| `dev` | `next dev --port 3020` |
| `build` | `next build` |
| `start` | `next start --port 3020` |
| `lint` | `eslint` |
| `check-types` | `tsc --noEmit` |
| `test` | Node unit tests (`src/lib/strapi/**/*.test.ts`) |
| `test:unit` | Same as `test` |
| `test:e2e` | Playwright D/T/M + axe + visual |
| `test:e2e:functional` | Playwright functional/a11y only (no visual regression) |
| `test:e2e:update` | Refresh visual baselines (`--update-snapshots=changed`) |

## Vercel

Set the Vercel project **Root Directory** to `apps/atlas-web` and enable **Include files outside the root directory in the Build Step**. See [`vercel.json`](./vercel.json). Production must declare its content-source mode explicitly.
