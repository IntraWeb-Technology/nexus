# Social Operations — Vertical Slice 1 (implemented)

This slice proves PostgreSQL ownership of social operational state with n8n orchestration and Postiz draft publishing.

## Implemented

- Five tables: `canonical_content`, `platform_publication`, `review_item`, `review_action`, `outbox_event`
- Atomic RPC: `ingest_editorial_draft`, `apply_review_action`
- Internal ingest: `POST /api/internal/social-ops/ingest`
- Outbox dispatch: `POST /api/internal/social-ops/outbox/dispatch` (Vercel cron every 3 minutes)
- Staff review APIs and `/admin/social-ops` UI
- n8n ingest mapping: `packages/n8n-workflows/07_social/_code/finalize-editorial-ingest.js`

## Deferred

- Auto-publish on approval
- Google Chat quick actions
- Full workflow JSON curation under `07_social` (WIP assets remain in `.tmp` until verified against deployed workflow `gHdJOdGpVHf6POqo`)
- `social.workflow.failed` portal outbox producer (n8n uses existing Google Chat alert on ingest failure)

See also: [social-ops-domain.md](./social-ops-domain.md), [social-ops-events.md](./social-ops-events.md), [social-ops-api.md](./social-ops-api.md).
