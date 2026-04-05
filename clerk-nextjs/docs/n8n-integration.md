# n8n integration with the portal

This document describes how the IntraWeb portal talks to n8n, how n8n calls back into the app, and how to wire HubSpot and post-payment flows.

## Environment

| Variable | Purpose |
|----------|---------|
| `N8N_BASE_URL` | n8n origin (no trailing slash), e.g. `https://n8n.intrawebtech.com` |
| `WEBHOOK_SECRET` | Shared secret; sent on **outbound** portal → n8n requests as header `x-intrawebtech-secret`, and required on **inbound** n8n → portal `POST /api/webhook/n8n` |

Align the same `WEBHOOK_SECRET` in Vercel and in your n8n workflow credentials or HTTP node headers.

## Outbound (portal → n8n)

The app POSTs JSON to paths under `N8N_BASE_URL` with optional headers:

- `x-intrawebtech-secret: <WEBHOOK_SECRET>` (omitted if `WEBHOOK_SECRET` is unset — not recommended in production)

Implemented webhooks (see `src/lib/n8n/client.ts`):

| Path | Trigger |
|------|---------|
| `/webhook/portal-message-received` | Client sends a message |
| `/webhook/portal-login` | Client login event |
| `/webhook/portal-document-request` | Document request flow |
| `/webhook/portal-invoice-paid` | Stripe Checkout completed; invoice marked paid in Supabase (`triggerInvoicePaid`) |

Create matching **Webhook** (or **Respond to Webhook**) nodes in n8n at those URL paths on your n8n host.

## Inbound (n8n → portal)

**URL (production):** `https://<your-portal-host>/api/webhook/n8n`

**Method:** `POST`

**Headers:**

- `Content-Type: application/json`
- `x-intrawebtech-secret: <WEBHOOK_SECRET>` — required; validated by `validateIntrawebSecret` in `src/lib/webhooks/secret.ts`

**Body:** JSON matching `N8nInboundPayload` in `src/lib/n8n/webhooks.ts`. Actions include `provision_client`, `add_invoice`, `update_milestone`, `log_activity`, and others handled in `src/app/api/webhook/n8n/route.ts`.

### Example: HubSpot → `provision_client`

After a deal is qualified in HubSpot, an n8n workflow can create the portal client and project:

```json
{
  "action": "provision_client",
  "project_slug": "acme-redesign",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 0100",
    "hubspot_contact_id": "12345",
    "hubspot_deal_id": "67890",
    "plan": "growth",
    "start_date": "2026-04-01"
  }
}
```

Use your real `project_slug` pattern and IDs from HubSpot properties.

### HubSpot → n8n → `add_invoice` (portal billing)

Billing reads **Supabase** only. When you create or update an invoice in HubSpot, n8n should POST to the portal so a row appears under **Billing**.

**Prerequisites**

1. The deal is linked to a portal project: `projects.hubspot_deal_id` in Supabase must match HubSpot’s deal ID (string). This is set when you run `provision_client` or you update the project in Supabase.
2. Same `WEBHOOK_SECRET` in Vercel and in the n8n HTTP Request node header `x-intrawebtech-secret`.

**Resolve project two ways (pick one per request)**

| Field | When to use |
|--------|-------------|
| `project_slug` | You already know the portal slug (e.g. from a HubSpot custom property). |
| `hubspot_deal_id` | HubSpot gives you the deal ID — no slug needed. Must match `projects.hubspot_deal_id`. |

**Example body (by HubSpot deal ID)**

```json
{
  "action": "add_invoice",
  "hubspot_deal_id": "12345678901",
  "data": {
    "invoice_number": "HS-INV-1042",
    "description": "Website build — deposit",
    "amount_cents": 1500000,
    "status": "pending",
    "due_date": "2026-05-01"
  }
}
```

`amount_cents` is an integer (e.g. `$1,500.00` → `150000`). `status` is one of: `paid`, `pending`, `overdue`, `void`.

**Example body (by portal slug)**

```json
{
  "action": "add_invoice",
  "project_slug": "acme-redesign",
  "data": {
    "invoice_number": "INV-0007",
    "description": "Monthly retainer",
    "amount_cents": 500000,
    "status": "pending",
    "sku": "MRR-GROWTH"
  }
}
```

**n8n workflow (outline)**

1. **Trigger** — Choose what HubSpot emits:
   - **HubSpot Workflow** → *Send webhook* to your **n8n Webhook** URL (production), or  
   - **HubSpot** node (polling / event) if you use the n8n HubSpot integration, or  
   - **HTTP Webhook** in n8n and register the URL in HubSpot developer webhook subscriptions (depends on your HubSpot plan and object type).

2. **Map fields** — Use a **Set** or **Code** node to build the JSON above. Map HubSpot invoice/line amount to `amount_cents` (multiply dollars by 100 and round). Map HubSpot deal ID to `hubspot_deal_id` (string).

3. **HTTP Request** node:
   - **Method:** POST  
   - **URL:** `https://<your-portal-host>/api/webhook/n8n`  
   - **Headers:**  
     - `Content-Type: application/json`  
     - `x-intrawebtech-secret: {{ $env.WEBHOOK_SECRET }}` (or n8n credential)  
   - **Body:** JSON from step 2.

4. **Idempotency** — If HubSpot retries, you may create duplicate portal invoices. Optionally branch on HubSpot invoice ID in n8n (store last-synced IDs) or add app logic later.

**Quick test (curl)**

```bash
curl -sS -X POST "https://<your-portal-host>/api/webhook/n8n" \
  -H "Content-Type: application/json" \
  -H "x-intrawebtech-secret: <WEBHOOK_SECRET>" \
  -d '{"action":"add_invoice","hubspot_deal_id":"<DEAL_ID>","data":{"invoice_number":"TEST-1","description":"Test","amount_cents":5000,"status":"pending"}}'
```

Expect `{"ok":true}`. The client should see the invoice on `/billing` after refresh.

### Example: post-payment branch (Stripe)

The portal updates invoices on `POST /api/webhook/stripe` (Stripe signing secret). It also notifies n8n at `N8N_BASE_URL/webhook/portal-invoice-paid` with:

```json
{
  "project_slug": "acme-redesign",
  "invoice_number": "INV-0001",
  "amount_cents": 500000,
  "stripe_checkout_session_id": "cs_test_..."
}
```

In n8n, listen on that webhook to send Slack/email, update HubSpot deal stage, or call other systems. **Do not** duplicate invoice state updates here if the portal webhook is already authoritative for “paid” in Supabase.

## Related routes

- HubSpot deal-stage updates (optional): `POST /api/webhook/hubspot` — updates project status when deal stage changes; requires the same secret pattern as other intraweb webhooks where applicable.

## Stripe webhook (Stripe → portal)

Configure in Stripe Dashboard → Webhooks:

- **URL:** `https://<your-portal-host>/api/webhook/stripe`
- **Events:** at minimum `checkout.session.completed`
- **Signing secret:** `STRIPE_WEBHOOK_SECRET` in the app environment

The handler uses the **raw** request body for signature verification.
