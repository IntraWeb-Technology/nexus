@AGENTS.md

# Atlas — Claude entry point

Atlas (`@repo/atlas-web`) is a mature, milestone-governed rebuild of johnschibelli.dev. This file is a pointer, not a copy — the documents below are the actual governance. Read them there; do not duplicate their contents here or in a parallel rule set.

- **Product / design / frontend / Strapi / testing / DoD rules:** `.cursor/rules/atlas-product.mdc`, `atlas-design.mdc`, `atlas-frontend.mdc`, `atlas-strapi.mdc`, `atlas-testing.mdc`, `atlas-definition-of-done.mdc`, `atlas-documentation.mdc` — these apply to Claude exactly as they apply to Cursor.
- **Anti-overengineering gate:** `.cursor/rules/no-overengineering.mdc` — build the smallest coherent solution; no speculative abstractions.
- **Canonical status / scope / implementation contract:** `apps/atlas-docs/content/architecture/build-manifest.mdx` (pointer: `docs/atlas/architecture/README.md`). Check current milestone status here before starting work.
- **Framework/runtime specifics:** `apps/atlas-web/AGENTS.md` (path aliases, Next.js version caveats).
- **Visual source of truth:** Figma "Atlas Design System" (`6r1KqLmwiB8TUXjyedezom`) — frozen pages win over implementation on visual disagreement; see `atlas-design.mdc` for the frozen-page list.
- **Validation commands:** `pnpm --filter @repo/atlas-web {lint,check-types,test,test:unit,test:e2e,build}`; root `pnpm lint`/`pnpm check-types`/`pnpm build` run the same via Turbo. Full DoD gate is `atlas-definition-of-done.mdc`.
