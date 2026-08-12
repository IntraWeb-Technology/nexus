# Social Operations — Domain Model (Vertical Slice 1)

PostgreSQL owns canonical social operational state. n8n orchestrates ingestion; Postiz owns draft media and publishing; IW Portal owns staff review.

## Entity ownership

| Entity | Owner | Notes |
|--------|-------|-------|
| `canonical_content` | PostgreSQL | Editorial asset from one n8n run |
| `platform_publication` | PostgreSQL | One row per platform draft in Postiz |
| `review_item` | PostgreSQL | Human decision request (status is a projection) |
| `review_action` | PostgreSQL | Immutable decision history (append-only) |
| `outbox_event` | PostgreSQL | Pending external side effects after commit |

## Identifier semantics

- `canonical_content.id` — portal UUID; never a Postiz or n8n id.
- `platform_publication.id` — portal UUID; distinct from canonical and Postiz ids.
- `postiz_batch_id` — batch-level Postiz identifier when returned.
- `postiz_post_id` — per-post Postiz identifier when returned; nullable.
- `postiz_integration_id` — Postiz channel/integration id.
- `external_publication_id` — future native platform id; nullable in slice 1.
- `source_workflow_id` — n8n workflow id (`gHdJOdGpVHf6POqo` for editorial calendar).
- `source_execution_id` — n8n execution id for correlation.
- `idempotency_key` — deterministic ingest key; unique on `canonical_content`.

Initial idempotency format: `editorial:<slot-date>:<slot-kind>` (e.g. `editorial:2026-07-09:primary`).

## Relationships

```text
canonical_content 1 ── * platform_publication
canonical_content 1 ── * review_item
review_item       1 ── * review_action
(outbox events reference review_item_id in payload JSON)
```

## Review scopes

| Scope | Slice 1 usage |
|-------|----------------|
| `publication_group` | **Used** — one review for all platform drafts from one editorial run |
| `individual_publication` | Deferred |
| `canonical_content` | Deferred |

## Review item status (projection)

| Status | Terminal |
|--------|----------|
| `pending` | No |
| `approved` | Yes |
| `rewrite_requested` | Yes |
| `skipped` | Yes |
| `failed` | Yes |

## Review actions (immutable)

| Action | Meaning |
|--------|---------|
| `approve` | Content acceptable for publication |
| `request_rewrite` | Regenerate or revise |
| `skip` | Do not publish from this review item |

`edit_and_approve` is deferred.

## Allowed transitions (slice 1)

```text
pending → approved
pending → rewrite_requested
pending → skipped
```

Terminal states reject further actions.

## Publication status

`draft`, `approved`, `scheduled`, `published`, `failed`, `skipped` — slice 1 records remain `draft` until a future publishing integration.

## Risk levels

`low`, `medium`, `high`, `critical` — generated editorial drafts default to `medium`.
