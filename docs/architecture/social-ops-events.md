# Social Operations — Outbox Events (Vertical Slice 1)

Transactional outbox lives in `outbox_event`. Events are inserted in the same database transaction as the state change they represent. Dispatch runs asynchronously via cron or manual internal call.

## `social.review.created`

| Field | Value |
|-------|-------|
| **Producer** | Ingest transaction (`ingest_editorial_draft` RPC) |
| **Trigger** | New grouped `review_item` in `pending` status |
| **Consumers** | Outbox dispatcher → Google Chat handler |
| **Retry** | Up to 5 attempts; exponential backoff via `available_at` |

### Payload

```json
{
  "review_item_id": "uuid",
  "canonical_content_id": "uuid",
  "editorial_category": "tech_news",
  "headline": "string",
  "topic": "string",
  "platforms": ["linkedin", "bluesky"],
  "risk_level": "medium",
  "review_url": "https://portal.intrawebtech.com/admin/social-ops"
}
```

## `social.review.completed`

| Field | Value |
|-------|-------|
| **Producer** | Review action transaction (`apply_review_action` RPC) |
| **Trigger** | Staff approve, request rewrite, or skip |
| **Consumers** | Outbox dispatcher → Google Chat handler (informational) |
| **Retry** | Same as above |

### Payload

```json
{
  "review_item_id": "uuid",
  "action": "approve | request_rewrite | skip",
  "actor_staff_id": "uuid",
  "note": "optional string"
}
```

## `social.workflow.failed`

| Field | Value |
|-------|-------|
| **Producer** | Deferred for slice 1 (n8n uses existing Google Chat alert workflow on ingest failure) |
| **Trigger** | — |
| **Consumers** | — |
| **Retry** | — |

Reserved for future portal-side workflow failure recording.
