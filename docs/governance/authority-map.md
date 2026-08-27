# Atlas authority map

**Purpose:** Single index of which repository artifacts control Atlas work. When two sources disagree within the same domain, stop and resolve — do not implement against conflict.

**Governance contract:** [`atlas-ai-assisted-engineering-v1.md`](./atlas-ai-assisted-engineering-v1.md)

| Domain | Authoritative source(s) | Path(s) | Notes |
| --- | --- | --- | --- |
| **AI-assisted engineering governance** | V1 contract | `docs/governance/atlas-ai-assisted-engineering-v1.md` | Task contract, risk classes, stop conditions, release gates, evidence package |
| **Governance exceptions** | Exception register | `docs/governance/exceptions.md` | Empty register at adoption; no implicit waivers |
| **Cursor agent enforcement (Atlas)** | Governance rule | `.cursor/rules/atlas-governance.mdc` | Pointer to V1; applies to Atlas-scoped work |
| **Product behavior & launch scope** | Build Manifest + product rule | `apps/atlas-docs/content/architecture/build-manifest.mdx`; `.cursor/rules/atlas-product.mdc` | Milestone scope, non-goals, route inventory |
| **Visual design & approved Figma** | Figma + design rule + M9D report | Figma file `6r1KqLmwiB8TUXjyedezom` (see Build Manifest); `.cursor/rules/atlas-design.mdc`; `apps/atlas-docs/content/architecture/m9d-art-direction.mdx` | Approved Figma frames govern visual intent. A conflict between Figma, tokens, or another approved visual authority is a V1 stop condition and requires human resolution. |
| **Design tokens & motion** | Global CSS + motion tokens | `apps/atlas-web/src/styles/globals.css`; `apps/atlas-web/src/lib/motion/tokens.ts` | **Gap:** dual sources; canonical viewport widths not yet centralized (V1 §7.3) |
| **Editorial / production copy (static)** | Committed content fixtures | `apps/atlas-web/src/content/**`; `apps/atlas-web/src/content/resilience.ts` | Story-First resilience copy locked in tests |
| **Editorial / production copy (CMS surfaces)** | Strapi `Article` + assemblers | `apps/cms-strapi/src/api/article/`; `apps/atlas-web/src/lib/strapi/assemble-article.ts`, `assemble-doc.ts` | Articles & docs handbook when CMS mode active |
| **Hybrid content architecture (v1)** | Decision record | `apps/atlas-docs/content/architecture/v1-content-architecture.mdx`; `apps/atlas-web/src/lib/strapi/source.ts`; `apps/atlas-web/src/lib/content/index.ts` | Static core vs CMS surfaces |
| **Strapi schema & migrations** | cms-strapi schemas + migration scripts | `apps/cms-strapi/src/api/**/schema.json`; `apps/cms-strapi/src/components/**`; `apps/cms-strapi/scripts/migrate-atlas/**`; `apps/cms-strapi/scripts/migrate/**` | **Gap:** no SQL migration tree; Strapi lint/check-types are no-ops |
| **Frontend CMS contract (types, query, normalize)** | strapi-client + Atlas client layer | `packages/strapi-client/**`; `apps/atlas-web/src/lib/strapi/**` | Site key `personal`; M8 contract: `apps/atlas-docs/content/architecture/m8-content-contract.mdx` |
| **Architecture & folder boundaries** | Architecture freeze + frontend rule | `apps/atlas-docs/content/architecture/architecture-freeze.mdx`; `.cursor/rules/atlas-frontend.mdc` | Rule of Two / Rule of Stability |
| **Definition of Done (milestones)** | DoD rule | `.cursor/rules/atlas-definition-of-done.mdc` | **Gap:** DoD requires CI visual gates; CI does not yet enforce (see baseline audit) |
| **Testing & Playwright** | Testing rule + config + e2e | `.cursor/rules/atlas-testing.mdc`; `apps/atlas-web/playwright.config.ts`; `apps/atlas-web/e2e/**` | Fixture mode default in Playwright webServer |
| **Visual regression baselines** | Playwright snapshots | `apps/atlas-web/e2e/*-snapshots/` | **Gap:** no controlled baseline-approval procedure in repo |
| **CI/CD (monorepo)** | GitHub Actions + affected script | `.github/workflows/ci.yml`; `.github/workflows/deploy.yml`; `.github/scripts/affected.mjs`; `.github/rulesets/ci-gate.json` | Atlas deploy via Vercel, not deploy.yml |
| **Release & deployment (Atlas web)** | Vercel project config | `apps/atlas-web/vercel.json`; Vercel project `nexus-atlas-web` | **Gap:** no in-repo release-readiness record tied to commit SHA |
| **Nexus monorepo boundaries** | Architecture rule | `.cursor/rules/nexus-architecture.mdc`; `docs/architecture/**` | Cross-app; not Atlas-specific |
| **Task intake template** | Issue template | `.github/ISSUE_TEMPLATE/atlas-engineering-task.yml` | Required for material Atlas tasks |
| **PR evidence fields** | Pull request template | `.github/pull_request_template.md` | Atlas Governance V1 section |
| **Decision log (material trade-offs)** | — | **MISSING** | Required by `atlas-documentation.mdc`; no dedicated file yet |
| **CODEOWNERS (Atlas paths)** | — | **MISSING** | `.github/CODEOWNERS` covers `iw-site-q2` only |
| **Canonical viewport definitions (versioned)** | — | **MISSING** | Playwright uses 1440/768/390; V1 also requires 1024px boundary |

## Pointer docs (not duplicate authority)

| Path | Role |
| --- | --- |
| `docs/atlas/architecture/README.md` | Index into Build Manifest and milestone reports |
| `apps/atlas-web/CLAUDE.md` | Atlas-web agent entry; points to V1 and domain rules |
| `apps/atlas-docs/CLAUDE.md` | Atlas-docs app entry only; stack/commands for docs site |
| `docs/governance/audits/2026-08-27-atlas-governance-v1-baseline.md` | **Historical** pre-adoption audit; preserve verbatim |
