@AGENTS.md

# Nexus — Claude entry point

This is a pointer, not a policy document. Nexus is a pnpm + Turborepo monorepo with multiple independently-governed apps under `apps/*`.

- **Repo-wide environment notes:** `AGENTS.md`, `README.md`.
- **Per-app governance:** each app under `apps/*` carries its own `CLAUDE.md`/`AGENTS.md` — read the one for the app you're working in before making changes (e.g. `apps/atlas-web/CLAUDE.md`, `apps/iw-portal/CLAUDE.md`).
- **Cross-app architecture rules:** `.cursor/rules/nexus-architecture.mdc` (always-applies) — app boundaries, shared-code policy, affected-only CI/Turbo behavior. These rules bind Claude the same as Cursor.
- **Atlas governance (when applicable):** work on Atlas-scoped paths or an explicitly authorized Atlas task is governed by `docs/governance/atlas-ai-assisted-engineering-v1.md`; authority conflicts require stopping for human resolution. Does not apply to unrelated monorepo applications.
- Do not refactor or reorganize an app you weren't asked to touch, and do not duplicate any app's governance into this file.
