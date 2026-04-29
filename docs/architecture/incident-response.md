# Incident response (first response)

Use this as a **first-step** checklist. Escalate and open provider dashboards (Vercel, Clerk, Stripe, Supabase, HubSpot, n8n) as needed.

## Website form failure (iw-site-q2)

1. Check Vercel logs for `apps/iw-site-q2` on the affected route (`/api/contact`, `/api/website-intake`).
2. Verify `RESEND_API_KEY`, `HUBSPOT_ACCESS_TOKEN`, reCAPTCHA env vars, and optional n8n URL/secrets.
3. If reCAPTCHA errors: confirm `GOOGLE_APPLICATION_CREDENTIALS_JSON` and Enterprise keys; check `RECAPTCHA_SKIP_IN_DEV` is not enabled in production.
4. If HubSpot validation errors: confirm property names (`pain_point`, etc.) and form GUID.
5. Use `CONTACT_INTEGRATION_DEBUG` / `WEBSITE_INTAKE_DEBUG_UPSTREAM` only in controlled environments to avoid leaking upstream errors.

## n8n workflow failure

1. Open n8n execution log for the failing workflow and note the last successful node.
2. Confirm credentials (HubSpot, Resend, Google, HTTP credentials) have not expired.
3. For **inbound** calls to the portal: verify URL, `x-intrawebtech-secret`, and payload shape per [webhook-contracts.md](./webhook-contracts.md) and [n8n-integration.md](../../apps/iw-portal/docs/n8n-integration.md).
4. For **outbound** from marketing: verify `N8N_CONTACT_WEBHOOK_URL` / kickoff URL and HMAC/header secrets match the workflow.
5. Use package [RUNBOOK.md](../../packages/n8n-workflows/RUNBOOK.md) for sync/push discipline; do not change workflow IDs casually.

## HubSpot sync failure

1. Check portal logs for `/api/webhook/hubspot` and integration event table if available.
2. Validate token: `HUBSPOT_PRIVATE_APP_TOKEN` vs `HUBSPOT_ACCESS_TOKEN` vs legacy `HUBSPOT_TOKEN` for the failing path.
3. Confirm deal/contact property definitions match scripts (`hubspot:ensure-*` in portal `package.json`).
4. For marketing forms: compare HubSpot Forms API field internal names with route expectations.

## Stripe webhook failure

1. Stripe Dashboard → Developers → Webhooks: check delivery status and response code from `/api/webhook/stripe`.
2. Confirm `STRIPE_WEBHOOK_SECRET` matches the endpoint in the deployed environment.
3. Check portal logs for `constructEvent` / handler errors.
4. For data fixes, use Stripe event replay only after fixing root cause.

## Supabase / database issue

1. Supabase dashboard: project health, connection limits, and recent migrations.
2. Portal: verify `NEXT_PUBLIC_SUPABASE_URL`, anon key, and service role key in Vercel.
3. Run `pnpm --filter @repo/iw-portal verify:stack` from a trusted machine with env (aligns Postgres host ref with Supabase project ref).
4. For schema drift: `db:pull` / migrations per team process — avoid manual prod edits without backup.

## Email delivery failure (Resend)

1. Confirm `RESEND_API_KEY` and domain verification in Resend.
2. Check Resend logs for bounces or blocks.
3. Portal: confirm `STAFF_EMAIL` / from-address configuration in `src/lib/email/send.ts`.

## Portal login / auth issue (Clerk)

1. Clerk dashboard: instance status, JWT templates, and satellite/domain settings.
2. Verify `NEXT_PUBLIC_CLERK_*` and `CLERK_SECRET_KEY` match the intended Clerk instance (dev vs prod).
3. Check `/api/webhook/clerk` for delivery errors if user provisioning is broken.
4. Review `src/lib/clerk-satellite.ts` and middleware for domain mismatches.
