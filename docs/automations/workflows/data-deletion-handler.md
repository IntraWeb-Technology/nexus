# Workflow: Data Deletion Handler

| Field | Value |
| --- | --- |
| File | `packages/n8n-workflows/05_client-success/SYS 05 - Data Deletion Handler.json` |
| ID | *(empty in curated export)* |
| Status | **Partially Implemented** |
| Trigger | Webhook `data-deletion-confirmed` |
| Business purpose | After verified data-subject confirmation, call portal privacy execution API, log, and email |

## Preconditions

- Shared secret validation in workflow
- Portal `/api/internal/privacy/execute-deletion` reachable with machine auth
- Marketing/site deletion request flow completed upstream

## Limitations

- Empty workflow ID blocks reliable ID-based sync/push.
- Hard-coded `dashboard.intrawebtech.com` host.
- Clerk proxy may intercept internal privacy routes before shared-secret auth (see portal audit).
- Request continues on error in places — verify partial deletion state carefully.

## Related

- `apps/iw-site-q2` data-deletion request API
- `apps/iw-portal` privacy execute library
