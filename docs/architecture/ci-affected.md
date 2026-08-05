# CI affected-package detection

Decision record for selective builds, tests, and deploys in the Nexus monorepo.

## Problem

Root CI previously ran unbounded `turbo run lint|check-types|build` on every PR/push. The workspace also included nested or incompatible trees (`personal-site`, Yarn docs, a duplicate Strapi copy), which broke Turbo and forced unrelated work.

## Decision

1. **Workspace hygiene** — Exclude non-graph members from `pnpm-workspace.yaml` until they are first-class packages:
   - `apps/_cms-strapi-build-check`
   - `apps/cms-strapi-docs` (submodule; Yarn)
   - `apps/personal-site` (nested Turbo monorepo)
   - `apps/ai-ops` (markdown only)
2. **Change detection** — `turbo query affected` via `.github/scripts/affected.mjs`, with fail-closed behavior on query/base errors.
3. **CI** — `.github/workflows/ci.yml` runs Detect → Validate (`turbo run … --filter=...[BASE]`) → always-on **CI Gate**.
4. **Deploy** — Next.js stays on Vercel `ignoreCommand`; Strapi image builds run from `.github/workflows/deploy.yml` only when `cms-strapi` is affected (or manually forced).
5. **Overrides** — `workflow_dispatch` inputs: `force_all`, `app`, `force_deploy`, `skip_turbo_cache`.

## Commands

```sh
# Local affected validation (compares to main by default)
pnpm ci:affected

# Explicit detection + summary JSON
pnpm affected

# Full suite
pnpm lint && pnpm check-types && pnpm test && pnpm build
```

## Required check

Configure branch protection (when available) to require the **CI Gate** job, not ephemeral matrix job names.

## Strapi Docker

```sh
pnpm exec turbo prune cms-strapi --docker
docker build -f apps/cms-strapi/Dockerfile -t cms-strapi:local .
```

Hostinger SSH apply is optional and only runs when `HOSTINGER_SSH_*` secrets are present.
