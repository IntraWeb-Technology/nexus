# Workflow: Qualified to Buy → Portal + Clerk

| Field | Value |
| --- | --- |
| File | `packages/n8n-workflows/03_sales/SYS 03 - Qualified to Buy → Portal + Clerk.json` |
| ID | `jERY0wN0aZ5kpOAR` |
| Status | **Partially Implemented** |
| Trigger | Webhook `hubspot-deal-qualified-portal` |
| Business purpose | When a HubSpot deal reaches qualified-to-buy, provision a portal client/project and seed invoice data; invite/link Clerk user |

## Preconditions

- HubSpot deal + contact data available to the workflow
- Portal reachable at configured base URL
- Valid `WEBHOOK_SECRET` on portal and matching request header
- Clerk configured for invites/linking via portal actions

## Processing (high level)

1. Receive HubSpot stage webhook payload.
2. Fetch deal/contact/company context from HubSpot.
3. `POST /api/webhook/n8n` with `provision_client`.
4. Optionally `add_invoice` for initial commercial state.
5. Drive Clerk invite / link through portal-supported actions.

## Portal impact

Creates or updates client/project rows clients can see after auth; staff see the client in admin directories.

## Error handling / limitations

- No strong per-node retry surface in curated export.
- **Curated graph differs from synced export** — confirm which side is authoritative before sync/push.
- Treat as Partially Implemented until live secret, host, and drift are verified in the target environment.

## Related

- Proposal and Contract Delivery (documents)
- HubSpot invoice → add_invoice
- `docs/audit/nexus-n8n-integration-map.md`
