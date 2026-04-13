/**
 * n8n Workflow SDK — HubSpot (or manual) → portal `provision_client` + optional `link_portal_clerk_user`.
 *
 * Import via n8n “Create workflow from code” / MCP. Set on n8n host: `WEBHOOK_SECRET` (must match portal).
 *
 * Suggested production wiring:
 * 1. HubSpot workflow “Send webhook” OR n8n HubSpot trigger → this webhook with deal + contact JSON.
 * 2. Code node maps HubSpot properties → `provision_client` body (see `docs/n8n-integration.md`).
 * 3. HTTP Request → `POST https://<portal>/api/webhook/n8n` with header `x-intrawebtech-secret`.
 * 4. Separate flow: after Clerk user exists with known `user_…`, POST `link_portal_clerk_user` if email
 *    did not match HubSpot’s primary email.
 */
import { workflow, trigger, node, expr, sticky } from '@n8n/workflow-sdk'

const stickyNote = sticky(
  'Map your HubSpot deal fields into the Code node:\n' +
    '• contact email, name, phone\n' +
    '• hs_object_id for contact + deal\n' +
    '• derive project_slug (e.g. slugify company + deal id)\n' +
    'Then POST to portal /api/webhook/n8n with provision_client JSON.',
  [],
  { color: 5 },
)

const hubspotOrManualWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'hubspot-deal-to-portal',
    parameters: {
      httpMethod: 'POST',
      path: 'hubspot-deal-to-portal',
      responseMode: 'lastNode',
      options: {},
    },
    position: [240, 300],
  },
  output: [
    {
      body: {
        deal_id: '67890123456',
        contact_id: '12345',
        contact_email: 'jane@example.com',
        contact_firstname: 'Jane',
        contact_lastname: 'Doe',
        plan: 'growth',
      },
    },
  ],
})

const buildProvisionPayload = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build provision_client JSON',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const b = $input.first().json.body || $input.first().json;
const slug = ('hs-' + String(b.deal_id)).replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 200);
return [{
  json: {
    url: $env.PORTAL_WEBHOOK_URL || 'https://dashboard.intrawebtech.com/api/webhook/n8n',
    headers: {
      'Content-Type': 'application/json',
      'x-intrawebtech-secret': $env.WEBHOOK_SECRET || '',
    },
    body: {
      action: 'provision_client',
      project_slug: slug,
      data: {
        name: [b.contact_firstname, b.contact_lastname].filter(Boolean).join(' ') || 'Client',
        email: String(b.contact_email || '').trim(),
        phone: b.contact_phone || undefined,
        hubspot_contact_id: String(b.contact_id),
        hubspot_deal_id: String(b.deal_id),
        plan: ['starter', 'growth', 'custom'].includes(b.plan) ? b.plan : 'starter',
        start_date: new Date().toISOString().slice(0, 10),
      },
    },
  },
}];`,
    },
    position: [520, 300],
  },
})

const postPortal = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'POST portal provision_client',
    parameters: {
      method: 'POST',
      url: expr('={{ $json.url }}'),
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'x-intrawebtech-secret', value: expr('={{ $json.headers["x-intrawebtech-secret"] }}') },
        ],
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr('={{ JSON.stringify($json.body) }}'),
      options: {},
    },
    position: [800, 300],
  },
})

export default workflow({
  name: 'Portal — HubSpot deal provision (skeleton)',
  nodes: [stickyNote, hubspotOrManualWebhook, buildProvisionPayload, postPortal],
  connections: {
    [hubspotOrManualWebhook.name]: { main: [[{ node: buildProvisionPayload.name, type: 'main', index: 0 }]] },
    [buildProvisionPayload.name]: { main: [[{ node: postPortal.name, type: 'main', index: 0 }]] },
  },
})
