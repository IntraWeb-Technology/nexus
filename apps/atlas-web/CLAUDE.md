@AGENTS.md

# Atlas — Claude entry point

Atlas (`@repo/atlas-web`) is a milestone-governed rebuild of johnschibelli.dev. This file is a pointer — not a copy of policy.

## Authority (read first)

| Domain | Controlling source |
| --- | --- |
| **AI-assisted engineering governance** | [`docs/governance/atlas-ai-assisted-engineering-v1.md`](../../docs/governance/atlas-ai-assisted-engineering-v1.md) |
| **Implementation scope & milestones** | [`apps/atlas-docs/content/architecture/build-manifest.mdx`](../atlas-docs/content/architecture/build-manifest.mdx) (pointer: [`docs/atlas/architecture/README.md`](../../docs/atlas/architecture/README.md)) |
| **Visual design** | Figma Atlas Design System (`6r1KqLmwiB8TUXjyedezom`); frozen pages in [`atlas-design.mdc`](../../.cursor/rules/atlas-design.mdc) |
| **Authority index** | [`docs/governance/authority-map.md`](../../docs/governance/authority-map.md) |

**Conflicts:** If governance, the Build Manifest, Figma, CMS contracts, or Cursor rules disagree within a domain, **stop**, report both sides with paths, and wait for human resolution. Do not pick the easiest source to implement.

Material Atlas work requires an explicit task contract (see V1 §4 and [`.github/ISSUE_TEMPLATE/atlas-engineering-task.yml`](../../.github/ISSUE_TEMPLATE/atlas-engineering-task.yml)).

## Cursor rules (domain detail)

Apply when working in Atlas paths — subordinate to V1 when aligned:

- **Governance:** `.cursor/rules/atlas-governance.mdc`
- **Product / design / frontend / Strapi / testing / DoD / docs:** `atlas-product.mdc`, `atlas-design.mdc`, `atlas-frontend.mdc`, `atlas-strapi.mdc`, `atlas-testing.mdc`, `atlas-definition-of-done.mdc`, `atlas-documentation.mdc`
- **Anti-overengineering:** `.cursor/rules/no-overengineering.mdc`

## Runtime specifics

- **Framework/path aliases:** [`apps/atlas-web/AGENTS.md`](./AGENTS.md)
- **Validation commands:** `pnpm --filter @repo/atlas-web {lint,check-types,test,test:unit,test:e2e,build}`; root `pnpm lint` / `pnpm check-types` / `pnpm build` via Turbo. Full milestone gate: `atlas-definition-of-done.mdc`.
