# CLAUDE.md — `apps/atlas-docs` only

This file governs the **Atlas product documentation site** (`apps/atlas-docs`). It does **not** govern `apps/atlas-web` (production frontend). For Atlas engineering governance, see [`docs/governance/atlas-ai-assisted-engineering-v1.md`](../../docs/governance/atlas-ai-assisted-engineering-v1.md) and [`apps/atlas-web/CLAUDE.md`](../atlas-web/CLAUDE.md).

## Project overview

Atlas product architecture, Build Manifest, and milestone reports live in this app's `content/` (Nextra MDX). The site is **Next.js 16 + Mantine 9 + Nextra 4**, excluded from the pnpm workspace; use **Yarn 4** here (not pnpm).

> **Obsolete (do not use):** Earlier versions of this file described a generic "Mantine Extensions ecosystem" starter. That identity is wrong for this repo — this app hosts **Atlas** product documentation. Stack/commands below remain valid for `apps/atlas-docs`.

## Commands

| Command | Purpose |
| --- | --- |
| `yarn dev` | Start Next.js dev server |
| `yarn build` | Production build (Next.js + pagefind search index) |
| `yarn test` | Full suite: typegen, oxfmt, lint, typecheck, jest |
| `yarn jest` | Run Jest tests only |
| `yarn jest:watch` | Jest in watch mode |
| `yarn jest -- path/to/file` | Run a single test file |
| `yarn typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `yarn lint` | oxlint + Stylelint |
| `yarn format:write` | Auto-format all TS/TSX/CSS files (oxfmt) |
| `yarn format:test` | Check formatting (oxfmt) |
| `yarn storybook` | Storybook dev server on port 6006 |
| `yarn analyze` | Bundle analysis with `@next/bundle-analyzer` |

## Architecture

### Routing & content

- **App Router** (`app/`): Next.js app router with Nextra integration
- **Docs content** (`content/`): MDX rendered at `/docs/[[...mdxPath]]`
- Nextra `contentDirBasePath: '/docs'`
- `content/_meta.ts` controls sidebar navigation

### Layout & theme

- `app/layout.tsx`: `MantineProvider` + Nextra `Layout`
- Dark mode: `MantineNextraThemeObserver`
- Theme overrides: `theme.ts`
- Site config: `config/index.ts`

### Key components

- `MantineNavBar` / `MantineFooter` — Nextra layout chrome
- `ColorSchemeControl` / `ColorSchemeToggle`
- `ReleaseNotes`, `Logo`, `Welcome`, `Content`

### API routes

- `app/api/version/` — package version
- `app/api/github-releases/` — GitHub releases proxy
- `app/api/search/` — pagefind search

### Search

[pagefind](https://pagefind.app/) index built post-build into `public/_pagefind/`.

### Tooling

- **Formatter:** oxfmt (`.oxfmtrc.json`)
- **Linter:** oxlint + stylelint
- **Package manager:** Yarn 4 (Berry) — do not use pnpm in this app

## Atlas product docs authority

Authoritative Atlas **product and architecture** content is under `content/architecture/` (Build Manifest, M8 contract, freeze reports, etc.). Nexus-wide standards remain in root [`docs/architecture/`](../../docs/architecture/). Do not duplicate governance across both — link instead (see `atlas-documentation.mdc`).
