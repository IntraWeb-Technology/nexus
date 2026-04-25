# n8n Script Deprecation (Legacy `apps/iw-site`)

`apps/iw-site` is a legacy app and is excluded from the active workspace.  
n8n workflow source-of-truth scripts now live in `packages/n8n-workflows/scripts`.

## Canonical commands

Run from repo root:

- `pnpm --filter @repo/n8n-workflows pull:n8n`
- `pnpm --filter @repo/n8n-workflows sync:n8n:package`
- `pnpm --filter @repo/n8n-workflows push:n8n:workflow "<path-to-workflow.json>"`

## Legacy script status

- `sync-workflows-to-n8n.mjs` -> **retired** (hard-stop).  
  Reason: name-based sync could create duplicate workflows.
- `pull-n8n-workflow.mjs` -> **retired** (hard-stop).
- `sync-workflows-from-n8n.mjs` -> wrapper to canonical package sync script.
- `export-n8n-workflows.mjs` -> wrapper to canonical package full pull script.
- `push-single-workflow.mjs` -> wrapper to canonical package push script with id mismatch guard.

If you need new automation, add it in `packages/n8n-workflows/scripts` only.
