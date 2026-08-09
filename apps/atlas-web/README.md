# Atlas (`@repo/atlas-web`)

Production frontend for Atlas — the ground-up rebuild of [johnschibelli.dev](https://johnschibelli.dev).

**Current milestone:** Home (`/`) + Work (`/work`). Other routes are not implemented.

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
├── app/                 # layout, `/`, `/work`
├── components/
│   ├── chrome/          # SiteNav, SiteNavActive, SiteFooter
│   ├── editorial/       # ChapterMarker, Figure
│   └── sections/        # page compositions (home-* / work-*)
├── content/             # fixtures (Strapi-shaped)
└── styles/              # tokens + globals
```

Reports:

- Homepage: [`apps/atlas-docs/content/architecture/homepage-pilot.mdx`](../atlas-docs/content/architecture/homepage-pilot.mdx)
- Work: [`apps/atlas-docs/content/architecture/work-route.mdx`](../atlas-docs/content/architecture/work-route.mdx)

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
| `test` | `check-types` (unit suite TBD) |
| `test:e2e` | Playwright D/T/M + axe + visual |
| `test:e2e:update` | Refresh visual baselines (`--update-snapshots=changed`) |

## Vercel

Set the Vercel project **Root Directory** to `apps/atlas-web` and enable **Include files outside the root directory in the Build Step**. See [`vercel.json`](./vercel.json).
