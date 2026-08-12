# Social Operations — API Contracts (Vertical Slice 1)

## Authentication

| Endpoint family | Auth |
|-----------------|------|
| `POST /api/internal/social-ops/*` | Header `x-intrawebtech-secret` matching `WEBHOOK_SECRET` |
| `GET/POST /api/admin/social-ops/*` | Clerk session + active `staff_users` row |
| Outbox cron | `Authorization: Bearer <CRON_SECRET>` or `x-intrawebtech-secret` |

Staff mutations require `admin`, `ops`, or `support` role (`canMutateStaff`).

---

## `POST /api/internal/social-ops/ingest`

Idempotent ingest of editorial draft metadata after Postiz draft creation.

### Request

```json
{
  "command": "ingest_editorial_draft",
  "workflow": {
    "name": "Content Pipeline — Editorial Calendar",
    "workflow_id": "gHdJOdGpVHf6POqo",
    "execution_id": "string",
    "slot_date": "2026-07-09"
  },
  "canonical": {
    "editorial_category": "tech_news",
    "topic": "string",
    "headline": "string",
    "body_long": "string",
    "body_short": "string",
    "primary_url": "https://example.com",
    "quality_score": 85,
    "novelty_score": 90
  },
  "publications": [
    {
      "platform": "linkedin",
      "publisher": "postiz",
      "postiz_batch_id": null,
      "postiz_post_id": null,
      "postiz_integration_id": null,
      "payload_snapshot": {},
      "publisher_response_snapshot": {}
    }
  ],
  "review": {
    "review_scope": "publication_group",
    "risk_level": "medium"
  },
  "idempotency_key": "editorial:2026-07-09:primary"
}
```

### Success response

**201 Created** or **200 OK** (idempotent replay):

```json
{
  "canonical_content_id": "uuid",
  "platform_publication_ids": ["uuid"],
  "review_item_id": "uuid",
  "outbox_event_id": "uuid",
  "idempotent_replay": false
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid command or payload |
| 401 | Invalid or missing secret |
| 500 | Ingest transaction failure |

---

## `GET /api/admin/social-ops/reviews`

Lists review items with canonical content summary. Query: `status` (optional), `limit` (default 50).

## `GET /api/admin/social-ops/reviews/[id]`

Full review bundle: review item, canonical content, publications, actions.

## `POST /api/admin/social-ops/reviews/[id]/actions`

### Request

```json
{
  "action": "approve",
  "note": "optional"
}
```

### Success

```json
{
  "review_item_id": "uuid",
  "status": "approved",
  "review_action_id": "uuid",
  "outbox_event_id": "uuid"
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid action |
| 401/403 | Not staff or viewer role |
| 404 | Review not found |
| 409 | Terminal state / invalid transition |

---

## `POST /api/internal/social-ops/outbox/dispatch`

Processes a bounded batch of due `outbox_event` rows.

### Response

```json
{
  "processed": 3,
  "published": 2,
  "failed": 0,
  "retry_scheduled": 1
}
```
