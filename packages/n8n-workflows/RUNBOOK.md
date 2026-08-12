# n8n Operator Runbook

This runbook defines the canonical workflow lifecycle for this monorepo.

Use these steps for routine maintenance, incident response, and release handoff.

## Scope and source of truth

- Workflow JSON source of truth: `packages/n8n-workflows/`
- Canonical scripts: `packages/n8n-workflows/scripts/`
- Legacy `apps/iw-site` was removed from this monorepo; use `packages/n8n-workflows` scripts only.

## Prerequisites

- Run commands from repo root.
- Ensure env vars are set (usually in local app env files):
  - `N8N_API_URL` (or `N8N_BASE_URL`)
  - `N8N_API_KEY`
  - optional `N8N_WORKFLOWS_PROJECT_ID` (`all` for full instance)

## Standard flow (pull -> review -> sync -> push -> validate)

1) Pull full remote snapshot (for discovery/audit)

```sh
pnpm --filter @repo/n8n-workflows pull:n8n
```

Writes remote exports to `packages/n8n-workflows/_synced-from-n8n/`.

2) Review drift

- Compare `_synced-from-n8n/` with curated JSON under `packages/n8n-workflows/`.
- Confirm which side is authoritative for each changed workflow before writing anything.
- Check stage and credential conventions in `packages/n8n-workflows/STAGES.md`.

3) Sync curated files from remote by workflow id

```sh
pnpm --filter @repo/n8n-workflows sync:n8n:package
```

This updates curated files by id and avoids name-based duplication risk.

4) Apply local edits to a specific curated workflow JSON

- Edit one workflow file under `packages/n8n-workflows/...`.
- Keep `id` intact.
- Prefer small, focused changes.

5) Push one curated workflow back to n8n

```sh
pnpm --filter @repo/n8n-workflows push:n8n:workflow "packages/n8n-workflows/<path>/<workflow>.json"
```

Notes:
- Push uses workflow `id` in the file.
- Script contains n8n 2.x guardrails for `activeVersion` drift.

6) Validate

- Confirm workflow opens and runs in n8n.
- Trigger the relevant webhook or test path from app scripts where applicable.
- Verify downstream side effects (HubSpot/Supabase/notifications) before closing.

## Incident mode (fast rollback/restore)

1. Pull full snapshot:
   - `pnpm --filter @repo/n8n-workflows pull:n8n`
2. Identify last known good curated JSON in git history.
3. Push that exact file by id with `push:n8n:workflow`.
4. Re-run affected integration tests and verify webhook traces.

## Guardrails

- Do not use name-based bulk push flows.
- Do not recreate workflows from retired marketing-site script entry points.
- Do not change workflow ids in curated JSON.
- Do not bypass secret/signature requirements documented in app webhook routes.

## Quick command reference

```sh
# Full remote export
pnpm --filter @repo/n8n-workflows pull:n8n

# Update curated JSON from remote by id
pnpm --filter @repo/n8n-workflows sync:n8n:package

# Push one curated workflow by id in file
pnpm --filter @repo/n8n-workflows push:n8n:workflow "packages/n8n-workflows/<file>.json"
```
