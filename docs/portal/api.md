# Portal — API index

Contracts are summarized from route handlers. Full webhook detail: `docs/architecture/webhook-contracts.md` and `apps/iw-portal/docs/n8n-integration.md`.

## Authentication legend

| Mode | Meaning |
| --- | --- |
| Clerk session | Browser user |
| Staff | Clerk + `staff_users` |
| Stripe signature | `Stripe-Signature` |
| Svix | Clerk webhook |
| Shared secret | `x-intrawebtech-secret` |
| Cron / internal | Vercel cron + secret as implemented per route |

## Webhooks

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/webhook/clerk` | Svix | User lifecycle / provisioning hooks |
| POST | `/api/webhook/stripe` | Stripe signature | Invoice/subscription events |
| POST | `/api/webhook/hubspot` | Shared secret | CRM mirror / deal updates |
| POST | `/api/webhook/n8n` | Shared secret | Provision, invoices, documents, milestones, activity, … |

## Client session APIs (representative)

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/messages` | Send client message |
| POST | `/api/milestones/approve` | Approve milestone |
| POST | `/api/proposals/decision` | Proposal viewed/approved/rejected |
| POST | `/api/documents/upload` | Signed upload URL |
| POST | `/api/documents/upload/confirm` | Confirm upload |
| GET | `/api/documents/download` | Download |
| POST | `/api/documents/sign` | Typed signature |
| POST | `/api/change-orders` | Create change order |
| POST | `/api/change-orders/[id]/cancel` | Cancel |
| POST | `/api/billing/*` | Checkout, portal, PDFs, etc. |
| POST | `/api/maintenance/subscribe` | Maintenance package |
| POST | `/api/notifications/mark-all-read` | Clear badges |

## Internal

| Method | Route | Purpose | Status note |
| --- | --- | --- | --- |
| * | `/api/internal/os/*` | Deal, intake, automation log, contracts, subscription sync | Implemented; Clerk-public in proxy |
| POST | `/api/internal/privacy/execute-deletion` | Execute DSR | Partial — proxy may block |
| POST | `/api/internal/social-ops/ingest` | Draft ingest | Experimental |
| POST | `/api/internal/social-ops/outbox/dispatch` | Outbox worker | Experimental |

## Admin Social Ops

| Method | Route | Purpose |
| --- | --- | --- |
| GET/PATCH | `/api/admin/social-ops/reviews` | List/update reviews |
| POST | `/api/admin/social-ops/reviews/[id]/actions` | Review actions |

## Health

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |

Consumers: Clerk, Stripe, HubSpot, n8n, Vercel cron, portal UI.
