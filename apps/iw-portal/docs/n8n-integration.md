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

Delivery semantics:

- `portal-login`, `portal-invoice-paid`, and `portal-stripe-catalog-payment` are dispatched as critical events (server awaits response with timeout + one retry).
- Other outbound webhook calls remain best-effort fire-and-forget.

Implemented webhooks (see `src/lib/n8n/client.ts`):

| Path | Trigger |
|------|---------|
| `/webhook/portal-message-received` | Client sends a message |
| `/webhook/portal-login` | Client login event |
| `/webhook/portal-document-request` | Document request flow |
| `/webhook/portal-invoice-paid` | Stripe Checkout completed; invoice marked paid in Supabase (`triggerInvoicePaid`) |
| `/webhook/portal-stripe-catalog-payment` | Stripe **catalog** Payment Link checkout completed (`triggerStripeCatalogCheckout`); HubSpot sync in n8n |
| `/webhook/portal-change-order` | Client submits **contractual change order** (PDF + HubSpot form + Supabase); see below |

Create matching **Webhook** (or **Respond to Webhook**) nodes in n8n at those URL paths on your n8n host.

### Catalog Payment Links: `portal-stripe-catalog-payment`

When Stripe sends `checkout.session.completed` to `POST /api/webhook/stripe`, the app may also POST to **`N8N_BASE_URL/webhook/portal-stripe-catalog-payment`** with header `x-intrawebtech-secret: <WEBHOOK_SECRET>` (same as other outbound calls).

**When it fires**

- Session `status` is `complete`, and either `mode === 'payment'` with `payment_status === 'paid'`, or `mode === 'subscription'` (completed subscription checkout).
- Session metadata does **not** include both `invoice_id` and `project_id` (those are reserved for portal invoice Checkout).
- And at least one of: `payment_link` is set, or metadata includes `sku`, or metadata includes `type`.

**Payment Link metadata contract** (Stripe copies link metadata onto the Checkout Session)

| Key | Required for HubSpot deal PATCH | Notes |
|-----|--------------------------------|--------|
| `sku` | No | e.g. `IW-WEB-STR` |
| `type` | No | e.g. `deposit`, `balance`, `full`, `subscription` |
| `hubspot_deal_id` | Yes for direct deal update | HubSpot deal object ID |
| `project_slug` | No | Lets n8n call `POST /api/webhook/n8n` (`add_invoice`, `log_activity`, …) without deal lookup |

Static Payment Links in the Stripe Dashboard cannot vary `hubspot_deal_id` per customer; use the API to set metadata per link, or add a future portal redirect that creates Checkout with metadata.

**Example body** (shape matches `StripeCatalogCheckoutPayload` in `src/lib/n8n/webhooks.ts`):

```json
{
  "event": "stripe_catalog_checkout_completed",
  "stripe_checkout_session_id": "cs_live_...",
  "stripe_payment_intent_id": "pi_live_...",
  "stripe_payment_link_id": "plink_...",
  "stripe_subscription_id": null,
  "mode": "payment",
  "amount_total": 350000,
  "currency": "usd",
  "customer_email": "payer@example.com",
  "metadata": {
    "sku": "IW-WEB-STR",
    "type": "deposit",
    "hubspot_deal_id": "12345678901"
  },
  "discounts": {
    "amount_discount_cents": 25000,
    "promotion_code_id": "promo_...",
    "coupon_id": "KPXZsqm0"
  }
}
```

`discounts` is omitted when there was no promotion. Use it for referral / promo reporting (e.g. `JUSTIN15`).

**Idempotency**

Stripe retries webhooks. In n8n, dedupe on `stripe_checkout_session_id` before PATCHing HubSpot or creating notes so retries do not double-apply payments.

**n8n responsibilities**

- If `metadata.hubspot_deal_id` is set: HubSpot CRM API to update deal amount / stage / custom payment fields and optionally create a **Note** on the deal.
- If only `customer_email` is available: resolve contact → open deal (your business rules; not implemented in the portal).
- Optionally call `POST https://<portal-host>/api/webhook/n8n` with `add_invoice` + `hubspot_deal_id` or `project_slug` to mirror paid lines in the client portal.

**Reference workflow (import in n8n)**

SDK source: [`docs/n8n-workflows/portal-stripe-catalog-payment.workflow.ts`](n8n-workflows/portal-stripe-catalog-payment.workflow.ts). It implements:

1. **Webhook** — `POST` path `portal-stripe-catalog-payment`, `responseMode` = response node.
2. **Code** — Compare `x-intrawebtech-secret` to `$env.WEBHOOK_SECRET`; dedupe with `$getWorkflowStaticData('global').stripeCatalogSessions` keyed by `stripe_checkout_session_id`; if `metadata.hubspot_deal_id` is set, build HubSpot `PATCH` body (custom deal properties listed in that file’s header — create them in HubSpot or edit `propertyMap` in the Code node).
3. **IF** — Only the `flow === 'patch'` branch runs **HTTP Request** `PATCH https://api.hubapi.com/crm/v3/objects/deals/{id}` with Bearer **HubSpot private app** credential (`crm.objects.deals.write`).
4. **Respond to Webhook** — `200` + JSON (`ok`, `flow`, `patched` / `dedupe` / `no_deal`); errors use `httpStatus` from the Code node (401/400).

### Change order: `portal-change-order`

After a successful portal submission, the app POSTs JSON matching `ChangeOrderRequestedPayload` in `src/lib/n8n/webhooks.ts` (including `co_number`, `pdf_signed_url`, `hubspot_deal_id`, `summary`, etc.). Use the same `x-intrawebtech-secret` header as other outbound webhooks.

**Recommended n8n workflow**

Reference implementation (Workflow SDK — import via n8n “Create workflow from code” or the n8n MCP): [`docs/n8n-workflows/portal-change-order-hubspot-note.workflow.ts`](n8n-workflows/portal-change-order-hubspot-note.workflow.ts).

1. On the n8n host, set environment variable **`WEBHOOK_SECRET`** to the same value as the portal / Vercel (used by the Code node in that workflow to validate `x-intrawebtech-secret`).
2. **Webhook** — Path: `portal-change-order` on your n8n host (full URL = `N8N_BASE_URL/webhook/portal-change-order`).
3. Validate the secret (the reference workflow uses a **Code** node).
4. **HTTP Request** to `POST https://api.hubapi.com/crm/v3/objects/notes` with Bearer auth (private app token with note + deal permissions). The reference workflow builds `hs_note_body` from `summary`, `co_number`, `pdf_signed_url`, and associates to the deal (`associationTypeId` **214** is the default HubSpot note→deal mapping — adjust if your portal uses custom association labels).
5. **Respond to Webhook** with `200` + `{ ok: true }` on success.
6. Optional: Slack/email to PM; optional **Task** for legal review.

**Example body** (shape only; use real IDs and URLs from the webhook item):

```json
{
  "project_slug": "acme-redesign",
  "title": "Add ecommerce module",
  "description": "Master agreement reference: SOW 2026-01\n\nCurrent scope...",
  "client_name": "Jane Doe",
  "client_email": "jane@example.com",
  "co_number": "CO-acme-redesign-A1B2C3",
  "change_order_id": "550e8400-e29b-41d4-a716-446655440000",
  "hubspot_deal_id": "67890123456",
  "hubspot_contact_id": "12345",
  "pdf_signed_url": "https://.....supabase.co/storage/v1/object/sign/change-order-packets/....",
  "summary": "Add ecommerce module\nSOW ref: SOW 2026-01\nEffective: 2026-05-01 · Cost: increase\nSigner: Jane Doe (VP Operations)"
}
```

If `hubspot_deal_id` is null, branch on contact ID or log-only path. **`pdf_signed_url`** may be null if PDF generation failed.

### Approve / decline in HubSpot → update portal status

HubSpot does not call the portal directly. Use **n8n** (or any server) to `POST` to the portal when a reviewer approves or declines:

**URL:** `POST https://<your-portal-host>/api/webhook/n8n`  
**Headers:** `Content-Type: application/json`, `x-intrawebtech-secret: <WEBHOOK_SECRET>`

**Body:**

```json
{
  "action": "update_change_order",
  "project_slug": "jschibelli-portal-2026",
  "data": {
    "change_order_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "staff_notes": "Approved as proposed. Legal cc'd."
  }
}
```

- **`change_order_id`** — UUID from the portal (also sent on outbound `portal-change-order` as `change_order_id`; you can store it on the HubSpot deal, task, or note via n8n).
- **`project_slug`** — Must match the portal project that owns the change order (prevents cross-project updates).
- **`status`** — One of: `pending`, `reviewed`, `approved`, `declined`, `cancelled`.
- **`staff_notes`** — Optional; shown to the client on the Change orders page when present.

**Typical HubSpot automation**

1. **Change order submitted** → existing `portal-change-order` n8n workflow creates a HubSpot **task** or **note** on the deal and copies `change_order_id` into a custom deal or task property (or into the task body).
2. When the task is marked complete or a deal property is set to “Approved”, a second **HubSpot workflow** triggers **Send webhook** to n8n (or n8n’s HubSpot trigger reads the property).
3. n8n **HTTP Request** node calls `/api/webhook/n8n` with `update_change_order` as above.

After a successful call, the client sees the new **status** badge on **Change orders** after refresh; they also get a portal **notification**.

## Inbound (n8n → portal)

**URL (production):** `https://<your-portal-host>/api/webhook/n8n`

**Method:** `POST`

**Headers:**

- `Content-Type: application/json`
- `x-intrawebtech-secret: <WEBHOOK_SECRET>` — required; validated by `validateIntrawebSecret` in `src/lib/webhooks/secret.ts`

**Body:** JSON matching `N8nInboundPayload` in `src/lib/n8n/webhooks.ts`. Actions include `provision_client`, `link_portal_clerk_user`, `add_invoice`, `update_milestone`, `update_change_order`, `log_activity`, and others handled in `src/app/api/webhook/n8n/route.ts`.

### Webhook auth model by route

- Shared secret (`x-intrawebtech-secret`): `/api/webhook/n8n`, `/api/webhook/hubspot`, internal OS automation routes.
- Provider signature verification: `/api/webhook/stripe` (Stripe signature), `/api/webhook/clerk` (Svix headers + Clerk secret).

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
    "start_date": "2026-04-01",
    "engagement_phase": "qualified",
    "seed_template_invoices": false
  }
}
```

Use your real `project_slug` pattern and IDs from HubSpot properties.

**`data.seed_template_invoices`:** when **`false`**, the portal does **not** insert `invoicesForPlan` rows (static list prices). Create payable rows with **`add_invoice`**, with `amount_cents` derived from the HubSpot deal/line items (after discounts). When **omitted** or **`true`**, the legacy template invoice seeds are still inserted (same as before this flag existed).

Optional **`data.engagement_phase`:** `"qualified"`** selects the **pre-contract** milestone template (shorter “qualification” track). Any other value or omission uses the standard delivery milestones for `data.plan`.

### Qualified to buy (SYS 00 → n8n → portal + Clerk)

When HubSpot sends a **`deal.propertyChange`** for **`dealstage`** into **`SYS 00 — HubSpot Events Router`**, the router treats **Qualified to buy** as a dedicated branch when the new stage is:

- HubSpot’s built-in token **`qualifiedtobuy`**, and/or
- listed in CONFIG **`hubspot.dealStageIds.qualifiedToBuy`** (comma-separated internal IDs), and/or
- listed in CONFIG **`hubspot.dealStageIds.leadQualified`** (unioned with the above for pipelines that map “qualified” to that custom stage).

SYS 00 then forwards to **`POST {n8nBaseUrl}/webhook/hubspot-deal-qualified-portal`** with the same **`{ id, properties }`** deal payload used for other deal webhooks.

### Marketing intake vs Qualified (stage gating)

- **`iw-site`** posts **`SYS 01`** payloads with an **early** deal stage (default HubSpot builtin **`appointmentscheduled`**, overridable with **`N8N_CONTACT_DEAL_STAGE`**). That keeps **Qualified to buy** as the explicit gate for this `provision_client` path.
- Align **CONFIG — Global Settings** in n8n: **`hubspot.dealStageIds.discoveryCallRequested`** for first-touch deals created inside n8n, and **`hubspot.dealStageIds.qualifiedToBuy` / `leadQualified`** so SYS 00’s union matches your live pipeline ids. See repo **[`packages/n8n-workflows/STAGES.md`](../../../packages/n8n-workflows/STAGES.md)**.

**Checked-in workflow (import in n8n):** [`packages/n8n-workflows/03_sales/SYS 03 — Qualified to Buy → Portal + Clerk.json`](../../../packages/n8n-workflows/03_sales/SYS%2003%20%E2%80%94%20Qualified%20to%20Buy%20%E2%86%92%20Portal%20+%20Clerk.json). After import, attach **HubSpot** credentials on **Fetch Deal From HubSpot** (or swap the node to your private-app pattern), activate the workflow, and set n8n **environment** variables **`WEBHOOK_SECRET`**, **`CLERK_SECRET_KEY`**, **`PORTAL_WEBHOOK_URL`** (unless CONFIG **`owner.portalN8nWebhookUrl`** is populated), and **`PORTAL_SIGNUP_REDIRECT_URL`** (unless CONFIG **`owner.portalSignUpUrl`** is populated). The flow calls **`provision_client`** with **`engagement_phase: "qualified"`** so the portal seeds pre-contract milestones (`src/lib/milestones-templates.ts`).

**Clerk checklist:** invitations use **`POST https://api.clerk.com/v1/invitations`** with the **same email** as `provision_client`. The workflow **lists users by email** first and skips creating an invitation if a user already exists; if the portal returns **`idempotent: true`** for the deal, it skips Clerk as well.

**Invoices:** checked-in **SYS 03** sends **`seed_template_invoices: false`**, then POSTs **`add_invoice`** in the “After portal response” Code node using the deal’s HubSpot **`amount`** (full discounted deal value in one pending row). Split deposits/balance with **additional** `add_invoice` calls in n8n (or replace that step) using line-item math from HubSpot. For legacy list-price template seeds, set **`seed_template_invoices: true`** or omit the field.

**Idempotency (deal continuity)** — If `data.hubspot_deal_id` is already stored on a `projects` row, the portal responds with `200` and `{ client_id, project_id, idempotent: true }` instead of inserting again. HubSpot/n8n retries therefore keep a single Supabase client + project tied to that deal.

### Continuity: Supabase ↔ HubSpot ↔ Clerk

Typical chain:

1. **HubSpot** (deal stage, workflow, or n8n HubSpot trigger) fires when a client is ready for the portal.
2. **n8n** calls `POST /api/webhook/n8n` with **`provision_client`**. That inserts `clients` (with `hubspot_contact_id`) and `projects` (with `hubspot_deal_id`). If `clerk_user_id` is omitted, the app stores a placeholder: `provision:hs:<hubspot_contact_id>`.
3. **Clerk** — You send an invite to the **same email** as in step 2. When the user is created, the portal’s **`user.created` Clerk webhook** tries **`link_portal_clerk_user` logic by email**: if a placeholder client row matches that email, `clerk_user_id` is replaced with the real `user_…` id. No duplicate client row is needed.
4. If the invite email differs from HubSpot (aliases, Google vs work), the automatic link may not run. Then **n8n** should call **`link_portal_clerk_user`** once you know the Clerk user id (Clerk API “list users” / search by email).

**`link_portal_clerk_user` (n8n → portal)** — `POST /api/webhook/n8n` with the same `x-intrawebtech-secret` header. No `project_slug` on the envelope.

```json
{
  "action": "link_portal_clerk_user",
  "data": {
    "clerk_user_id": "user_2abc…",
    "hubspot_contact_id": "12345"
  }
}
```

Either `hubspot_contact_id` or `email` (matching the provisioned `clients.email`) is required together with `clerk_user_id`. Responses: `200` + `{ ok: true, result: "linked" | "noop_already" }`, `404` if no placeholder row matched, `409` on update conflict.

**HubSpot-backed UI** — After `hubspot_deal_id` and `hubspot_contact_id` are set, configure **`HUBSPOT_PRIVATE_APP_TOKEN`** on the portal host so billing/activity/deal widgets can read CRM data (see `src/lib/hubspot/config.ts`).

**Future (optional CRM cache)** — If the dashboard must show a large, stable snapshot of HubSpot contact fields without a round-trip on every request, add a narrow sync (HubSpot workflow or n8n on `contact.propertyChange`) that POSTs a small JSON blob into Supabase keyed by `hubspot_contact_id`. Today the portal reads CRM slices on demand via the HubSpot API using ids stored on `clients` / `projects`.

**Reference workflow (import in n8n)** — Skeleton: [`docs/n8n-workflows/portal-hubspot-deal-provision.workflow.ts`](n8n-workflows/portal-hubspot-deal-provision.workflow.ts). Set `PORTAL_WEBHOOK_URL` on the n8n host to your portal’s `/api/webhook/n8n` URL (or edit the Code node default).

### HubSpot → n8n → `add_invoice` (portal billing)

**On-demand sync (no n8n required):** When a signed-in user opens **Billing** or the **Dashboard**, the portal loads HubSpot CRM invoices via the API, **upserts** matching rows into Supabase (service role) with `hubspot_invoice_id` set, then reads `invoices` with the user client so Stripe and reconciliation use the same rows even if n8n did not fire.

**n8n (optional, earlier sync):** When you create or update an invoice in HubSpot, a workflow can still POST to the portal so a row exists **before** the client next loads the app.

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
    "due_date": "2026-05-01",
    "hubspot_invoice_id": "98765432109",
    "currency": "usd"
  }
}
```

`amount_cents` is an integer (e.g. `$1,500.00` → `150000`). `status` is one of: `paid`, `pending`, `overdue`, `void`.

Optional fields on `data` (supported by [`applyAddInvoice`](../src/lib/n8n/apply-add-invoice.ts)):

| Field | Type | Purpose |
|--------|------|---------|
| `currency` | string | Three-letter code (stored lowercase), e.g. `usd`. |
| `paid_at` | ISO 8601 string | When the invoice was paid outside Stripe (HubSpot). Only written when `status` is `paid` and the value parses as a date. Example pair: `"status": "paid", "paid_at": "2026-04-20T15:00:00.000Z"`. |

**`hubspot_invoice_id` (optional):** HubSpot CRM `invoices` object id. When n8n sends the **same** id on a later sync, the portal **updates** the existing Supabase row (amount, number, status, description, `project_id`) instead of inserting again. This keeps **Supabase as the billing source of truth** while **deduplicating** the merged client view: rows with a matching `hubspot_invoice_id` are not double-listed with HubSpot-fetched invoices in `mergeBillingRows`. **Omit** for portal-only invoices with no HubSpot invoice record.

**Always send `hubspot_invoice_id` when the row comes from HubSpot CRM** so n8n retries and status changes update the same Supabase row instead of inserting duplicates (until the next Billing page CRM sync dedupes).

### HubSpot CRM invoice → `data` field matrix

Use this when building the JSON in a HubSpot workflow, n8n **Set** node, or Code node before calling the portal. Property names follow HubSpot CRM invoices (see [`mapInvoiceObject`](../src/lib/hubspot/invoices.ts) for how the portal reads the same object from the API).

| HubSpot property (typical) | `add_invoice` `data` field | Supabase column | Notes |
|-----------------------------|----------------------------|-------------------|--------|
| Object `id` | `hubspot_invoice_id` | `hubspot_invoice_id` | **Strongly recommended** for upserts. |
| `hs_invoice_number` or `hs_number` | `invoice_number` | `invoice_number` | |
| `hs_title`, `hs_comments` (or your composed line-item text) | `description` | `description` | Shown in billing table, invoice detail, PDF. |
| Balance / total (you choose rule; see portal `pickAmountCents`) | `amount_cents` | `amount_cents` | Integer cents. |
| `hs_invoice_status` (mapped) | `status` | `status` | Map HubSpot to portal: `paid` → `paid`, `voided` → `void`, `open` / `draft` → `pending`, else `pending` or `overdue` if past due. |
| `hs_due_date` | `due_date` | `due_date` | `YYYY-MM-DD` preferred. |
| `hs_currency` | `currency` | `currency` | Optional. |
| Payment / close date | `paid_at` | `paid_at` | Optional; use when `status` is `paid` and Stripe did not set it. |
| Deal association | Top-level `hubspot_deal_id` on the request (not inside `data`) | `project_id` (resolved) | Must match `projects.hubspot_deal_id`. |

### SYS 03 workflow: `portal-add-invoice` (repo export)

The synced workflow [`packages/n8n-workflows/_synced-from-n8n/SYS 03 — Portal — HubSpot invoice → add_invoice __ isYyC3wLTBiGPhJS.json`](../../packages/n8n-workflows/_synced-from-n8n/SYS%2003%20%E2%80%94%20Portal%20%E2%80%94%20HubSpot%20invoice%20%E2%86%92%20add_invoice%20__%20isYyC3wLTBiGPhJS.json) exposes webhook path **`portal-add-invoice`**. Its **Build add_invoice payload** Code node normalizes inbound JSON for operators:

- Copies **`hubspot_invoice_id`** from `hubspot_invoice_id`, `hs_invoice_id`, or `invoice_id`.
- **`due_date`**: accepts `due_date` or `hs_due_date`, normalizes ISO timestamps to `YYYY-MM-DD`.
- **`description`**: uses `description`, else `hs_title`, `hs_comments`, `name`, `subject`, else the literal `Invoice`.
- Forwards optional **`currency`** and **`paid_at`** into `data` when present.

Point your **upstream** HubSpot automation at this n8n webhook URL (or chain HubSpot → n8n Set fields → this workflow) so the POST body includes at least `hubspot_deal_id` **or** `project_slug`, plus invoice fields aligned with the table above.

### Upstream mapping checklist (HubSpot → n8n → portal)

1. **Deal** — Include `hubspot_deal_id` (string) on the webhook payload unless you use `project_slug` instead.
2. **Invoice id** — Include the HubSpot CRM invoice object id as `hubspot_invoice_id` (or alias `hs_invoice_id` / `invoice_id` for SYS 03).
3. **Amount** — Compute `amount_cents` as integer cents (never floats).
4. **Status** — Map HubSpot `hs_invoice_status` to one of `paid`, `pending`, `overdue`, `void`.
5. **Description** — Prefer a human-readable string (title + line items); avoid empty strings so the portal billing UI is not blank.
6. **Paid HubSpot invoices** — Set `status: "paid"` and optional `paid_at` ISO so Supabase matches reality when Stripe is not in the loop.

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

4. **Idempotency** — Send `hubspot_invoice_id` on every sync so [`applyAddInvoice`](../src/lib/n8n/apply-add-invoice.ts) updates the same row. Without it, HubSpot retries can insert duplicate Supabase rows until the next CRM merge on the Billing page.

**Quick test (curl)**

```bash
curl -sS -X POST "https://<your-portal-host>/api/webhook/n8n" \
  -H "Content-Type: application/json" \
  -H "x-intrawebtech-secret: <WEBHOOK_SECRET>" \
  -d '{"action":"add_invoice","hubspot_deal_id":"<DEAL_ID>","data":{"invoice_number":"TEST-1","description":"Test","amount_cents":5000,"status":"pending","hubspot_invoice_id":"<HS_INVOICE_OBJECT_ID>"}}'
```

Expect `{"ok":true,"result":"inserted"}` or `{"ok":true,"result":"updated"}` when the same `hubspot_invoice_id` is sent again. The client should see the invoice on `/billing` after refresh.

### Example: post-payment branch (Stripe)

The portal updates invoices on `POST /api/webhook/stripe` (Stripe signing secret). For **portal** invoice Checkout (metadata includes `invoice_id` and `project_id`), it notifies n8n at `N8N_BASE_URL/webhook/portal-invoice-paid` with:

```json
{
  "project_slug": "acme-redesign",
  "invoice_number": "INV-0001",
  "amount_cents": 500000,
  "stripe_checkout_session_id": "cs_test_..."
}
```

In n8n, listen on that webhook to send Slack/email, update HubSpot deal stage, or call other systems. **Do not** duplicate invoice state updates here if the portal webhook is already authoritative for “paid” in Supabase.

Portal **invoice** Checkout sessions (created in [`src/app/api/billing/create-checkout-session/route.ts`](../src/app/api/billing/create-checkout-session/route.ts)) also copy Stripe **`metadata`** keys **`hubspot_deal_id`** and **`project_slug`** when present on the project, so monitoring and downstream automations can correlate payment to HubSpot and the portal without relying only on Supabase UUIDs.

For **catalog** Payment Links (and subscription links with `sku` / `type` / `payment_link`), the same Stripe webhook handler notifies **`/webhook/portal-stripe-catalog-payment`** — see [Catalog Payment Links](#catalog-payment-links-portal-stripe-catalog-payment) above.

## Pre-contract visibility, contracts, and RLS (checklist)

Use this as a **runbook** for product and compliance; avoid shipping new database policies until owners explicitly approve exposure rules.

- **Contract capture:** choose one primary path (external e-sign, HubSpot quotes/contracts, or portal-native documents) and document it for engineering and legal.
- **RLS / visibility:** audit `apps/iw-portal/supabase/migrations` for what a **qualified** (pre-close) client should see versus staff-only rows; if needed, add **`project.status`**-aware policies (for example hiding certain document types until a contract is recorded).

## Related routes

- HubSpot deal-stage updates (optional): `POST /api/webhook/hubspot` — updates project status when deal stage changes; requires the same secret pattern as other intraweb webhooks where applicable.

## Stripe webhook (Stripe → portal)

Configure in Stripe Dashboard → Webhooks:

- **URL:** `https://<your-portal-host>/api/webhook/stripe`
- **Events:** at minimum `checkout.session.completed`
- **Signing secret:** `STRIPE_WEBHOOK_SECRET` in the app environment

The handler uses the **raw** request body for signature verification.

Implementation: [`src/app/api/webhook/stripe/route.ts`](../src/app/api/webhook/stripe/route.ts). After verifying the event, it marks portal invoices when metadata includes `invoice_id` and `project_id`, then forwards catalog sessions to n8n per [`src/lib/stripe/catalog-checkout-n8n.ts`](../src/lib/stripe/catalog-checkout-n8n.ts).
