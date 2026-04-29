# Webhook contracts

Inbound routes live in Next.js App Router. Outbound “webhooks” to n8n are HTTP `POST` calls from route handlers. Payload shapes for n8n provisioning are documented in [apps/iw-portal/docs/n8n-integration.md](../../apps/iw-portal/docs/n8n-integration.md).

## Clerk — user lifecycle

- **Source:** Clerk (Svix)
- **Target:** `iw-portal` `POST /api/webhook/clerk`
- **Auth:** `CLERK_WEBHOOK_SECRET`; headers `svix-id`, `svix-timestamp`, `svix-signature`; verified with Svix `Webhook.verify`
- **Payload:** Clerk webhook JSON (`type`, `data`) after verification
- **Idempotency:** Partially via integration event logging and downstream logic; confirm per event type in route implementation
- **Failure:** 400 on bad signature; 500 if secret missing; provider retries per Clerk/Svix policy
- **Tests:** Unknown — add under `apps/iw-portal` if missing
- **Unknowns:** Exact retry backoff; full list of handled `evt.type` values without reading full route file

## Stripe — billing events

- **Source:** Stripe
- **Target:** `iw-portal` `POST /api/webhook/stripe`
- **Auth:** `STRIPE_WEBHOOK_SECRET`; header `stripe-signature`; `stripe.webhooks.constructEvent`
- **Payload:** Stripe `Event` object
- **Idempotency:** Rely on Stripe event IDs and DB updates (see route for invoice/subscription handling)
- **Failure:** 400 without signature; processing errors logged; Stripe retries
- **Tests:** Unknown at repo level for full webhook handler
- **Unknowns:** Full subscribed event type list in dashboard vs code branches

## HubSpot — deal/contact notifications

- **Source:** HubSpot (automation forwarding normalized payloads) and/or internal forwarders
- **Target:** `iw-portal` `POST /api/webhook/hubspot`
- **Auth:** Shared secret: header `x-intrawebtech-secret` must equal `WEBHOOK_SECRET` (`validateIntrawebSecret`)
- **Payload:** Either a normalized object with `action` (e.g. `deal_property_change`, `hubspot_deal_stage`) or an array of legacy event objects
- **Idempotency:** Integration events recorded; CRM mirror and stage handlers should be safe to retry — confirm for each branch
- **Failure:** 401 if secret wrong; 400 on malformed body
- **Tests:** Unknown
- **Unknowns:** Exact HubSpot subscription configuration in HubSpot UI

## n8n — portal automation inbound

- **Source:** n8n (HTTP Request to portal)
- **Target:** `iw-portal` `POST /api/webhook/n8n`
- **Auth:** Same as HubSpot inbound: `x-intrawebtech-secret` === `WEBHOOK_SECRET`
- **Payload:** JSON with `action` and app-specific fields (`project_slug`, etc.); see `N8nInboundPayload` types and n8n docs
- **Idempotency:** `findProjectByHubSpotDealId` and related helpers for provisioning; per-action behavior varies
- **Failure:** 401 unauthorized; 400 invalid JSON; 404 when project missing; errors logged
- **Tests:** `pnpm --filter @repo/iw-portal test` includes `provision-client-idempotency.test.ts`
- **Unknowns:** Full matrix of `action` values vs workflows in production

## Marketing — contact form → n8n (outbound)

- **Source:** `iw-site-q2` `POST /api/contact` (server)
- **Target:** `N8N_CONTACT_WEBHOOK_URL` (n8n webhook URL)
- **Auth:** Optional header: default name `X-Intraweb-Website-Intake-Secret` or overrides via `MARKETING_N8N_WEBHOOK_SECRET_HEADER` / `N8N_WEBHOOK_SECRET_HEADER`; value from `MARKETING_N8N_WEBHOOK_SECRET` or `N8N_WEBHOOK_SECRET`
- **Payload:** `buildN8nContactLeadWebhookPayload` — contact id + tier metadata
- **Idempotency:** None at HTTP level; n8n must tolerate duplicates
- **Failure:** Logged; user may still get 200 if email path succeeded — confirm UX in route
- **Tests:** Unknown
- **Unknowns:** Production URL and workflow ID (managed in n8n)

## Marketing — website intake → n8n (outbound)

- **Source:** `iw-site-q2` `POST /api/website-intake`
- **Target:** `N8N_CONTACT_WEBHOOK_URL` or env-configured URL in route
- **Auth:** Same pattern as contact (shared secret headers)
- **Payload:** Intake + HubSpot deal context; see route and `WEBSITE_INTAKE_STRICT_N8N` behavior
- **Idempotency:** Unknown — depends on n8n workflow
- **Failure:** Configurable strict mode; timeouts use `N8N_WEBHOOK_TIMEOUT_MS` (default 55000 ms)
- **Tests:** Unknown
- **Unknowns:** Exact payload schema exported in docs

## Marketing — kickoff booked → n8n (outbound)

- **Source:** `iw-site-q2` `POST /api/kickoff/book`
- **Target:** `N8N_KICKOFF_BOOKED_WEBHOOK_URL`
- **Auth:** Same marketing secret header pattern as contact
- **Payload:** Booking + HubSpot update result context
- **Idempotency:** Unknown
- **Failure:** Logged; user-facing path depends on route
- **Tests:** Unknown

## n8n workflow tooling (package scripts)

- **Source:** Developer machine / CI
- **Target:** n8n REST API (`N8N_API_URL` / `N8N_BASE_URL` + `N8N_API_KEY`)
- **Auth:** API key
- **Payload:** Workflow JSON per script
- **Idempotency:** Push scripts may re-publish; see `N8N_WORKFLOWS_RE_PUBLISH`
- **Failure:** Scripts exit non-zero; no automatic retry
- **Docs:** [packages/n8n-workflows/RUNBOOK.md](../../packages/n8n-workflows/RUNBOOK.md)
