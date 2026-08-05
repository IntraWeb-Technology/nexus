# Integration map

| Integration | Used By | Purpose | Env vars (representative) | Runtime risk | Notes |
| --- | --- | --- | --- | --- | --- |
| Clerk | iw-portal | Auth, user webhooks, Supabase JWT template | `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_SUPABASE_JWT_TEMPLATE` | **High** — portal unusable without auth | Satellite/proxy URLs must match deployment domains. |
| Supabase | iw-portal | Portal data (Postgres via Supabase client) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` | **High** | Service role used server-side; RLS depends on Clerk JWT. |
| Stripe | iw-portal | Checkout, invoices, subscriptions, webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_MAINTENANCE_PACKAGES` | **High** | Webhook signature verification required in prod. |
| Resend | iw-portal, iw-site-q2 | Transactional email | `RESEND_API_KEY` | **Medium** | Portal uses `STAFF_EMAIL` for operational emails. |
| HubSpot | iw-portal, iw-site-q2 | CRM, deals, contacts, forms | `HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_TOKEN`, `NEXT_PUBLIC_HUBSPOT_ID`, `HUBSPOT_FORM_GUID`, plus many optional property/pipeline overrides | **High** for lead flow | Token variant confusion is a common misconfiguration. |
| n8n | iw-portal, iw-site-q2, n8n-workflows | Automation, provisioning, notifications | Portal: `N8N_BASE_URL`, `WEBHOOK_SECRET`. Marketing: `N8N_CONTACT_WEBHOOK_URL`, `N8N_KICKOFF_BOOKED_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `MARKETING_N8N_*`. Package: `N8N_API_KEY`, `N8N_API_URL` / `N8N_BASE_URL` | **High** | Inbound portal webhook uses `x-intrawebtech-secret`. Outbound uses same `WEBHOOK_SECRET` pattern for signing. |
| Cal.com | iw-site-q2 | Kickoff scheduling, booking API | `CAL_API_KEY`, `NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK`, `CAL_EVENT_TYPE_ID`, `CAL_ORGANIZATION_SLUG`, `CAL_BOOKING_MANAGE_URL_BASE` | **Medium** | Kickoff route updates HubSpot and may notify n8n. |
| reCAPTCHA Enterprise | iw-site-q2 | Bot protection on forms | `RECAPTCHA_ENTERPRISE_*`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` | **Medium** | Dev bypass flags exist; must stay off in prod. |
| Anthropic | iw-site-q2 | Contact flow (when configured) | `ANTHROPIC_API_KEY` | **Low**–**Medium** | Feature may degrade gracefully if key missing (confirm in route). |
| Vercel | iw-portal, iw-site-q2 | Hosting, env, preview URLs | Platform env vars (`VERCEL_URL`, etc.); scripts use Vercel API via env in `vercel-align-env` | **High** | `turbo.json` env allowlists affect build reproducibility. |
| Google Drive | n8n (workflows) | Client document folders, uploads from workflows | Credentials in **n8n**, not app `.env` | **Medium** | Appears in workflow JSON and sample payloads (`client_drive_folder_id`). |
