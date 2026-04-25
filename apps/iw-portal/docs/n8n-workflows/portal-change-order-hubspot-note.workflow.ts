/**
 * n8n Workflow SDK source — validate then import via MCP or paste into "Create from code".
 *
 * Credentials required in n8n:
 *   - HubSpot PAT: httpBearerAuth (Bearer token = private app token with crm.objects.notes.write + crm.objects.deals.read)
 * Environment variable on n8n host: WEBHOOK_SECRET (must match portal)
 *
 * After create: set Webhook URL on production to match your n8n base + /webhook/portal-change-order
 *
 * Association type 214 = default HubSpot "note to deal". If create fails, confirm in HubSpot association API.
 */
import { workflow, trigger, node, ifElse, newCredential, expr, sticky } from '@n8n/workflow-sdk'

const noteSticky = sticky(
  'Portal sends JSON body with hubspot_deal_id, summary, pdf_signed_url, co_number, etc.\nRequires WEBHOOK_SECRET env on n8n.\nIf note association fails, verify associationTypeId 214 for note→deal.',
  [],
  { color: 4 },
)

const webhookPortalCo = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'portal-change-order',
    parameters: {
      httpMethod: 'POST',
      path: 'portal-change-order',
      responseMode: 'responseNode',
      options: {},
    },
    position: [240, 400],
  },
  output: [
    {
      headers: { 'x-intrawebtech-secret': 'dev' },
      body: {
        hubspot_deal_id: '123456789',
        co_number: 'CO-demo-ABC',
        summary: 'Demo change order\nSOW: test',
        pdf_signed_url: 'https://example.com/signed',
        client_name: 'Demo Client',
        client_email: 'demo@example.com',
        project_slug: 'demo',
      },
    },
  ],
})

const validateAndBuildNote = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Validate secret and build note',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const item = $input.first().json;
const headers = item.headers || {};
const headerSecret = headers['x-intrawebtech-secret'] ?? headers['X-Intrawebtech-Secret'] ?? '';
if (headerSecret !== ($env.WEBHOOK_SECRET || '')) {
  return [{ json: { authorized: false, httpStatus: 401, message: 'Unauthorized' } }];
}
const body = item.body || {};
if (!body.hubspot_deal_id) {
  return [{ json: { authorized: false, httpStatus: 400, message: 'hubspot_deal_id required', body } }];
}
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const summary = esc(body.summary).replace(/\n/g, '<br/>');
const pdfUrl = body.pdf_signed_url ? esc(body.pdf_signed_url) : '';
const pdf = pdfUrl
  ? '<p><a href="' + pdfUrl + '">Download PDF packet</a> (link expires)</p>'
  : '<p><em>PDF link not available</em></p>';
const html = '<p><strong>' + esc(body.co_number) + '</strong> — ' + esc(body.project_slug) + '</p><p>' + summary + '</p>' + pdf + '<p>' + esc(body.client_name) + ' — ' + esc(body.client_email) + '</p>';
const dealId = String(body.hubspot_deal_id).replace(/[^0-9]/g, '') || String(body.hubspot_deal_id);
return [{
  json: {
    authorized: true,
    httpStatus: 200,
    notePayload: {
      properties: {
        hs_timestamp: new Date().toISOString(),
        hs_note_body: html,
      },
      associations: [
        {
          to: { id: dealId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }],
        },
      ],
    },
  },
}];`,
    },
    position: [520, 400],
  },
  output: [
    {
      authorized: true,
      httpStatus: 200,
      notePayload: {
        properties: { hs_timestamp: '2026-04-07T00:00:00.000Z', hs_note_body: '<p>...</p>' },
        associations: [
          {
            to: { id: '123' },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }],
          },
        ],
      },
    },
  ],
})

const checkAuthorized = ifElse({
  version: 2.2,
  config: {
    name: 'Authorized and has deal?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [
          {
            id: 'auth',
            leftValue: "={{ $json.authorized }}",
            rightValue: true,
            operator: { type: 'boolean', operation: 'equals', name: 'filter.operator.equals' },
          },
        ],
        combinator: 'and',
      },
    },
    position: [760, 400],
  },
})

const hubspotCreateNote = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'HubSpot create note on deal',
    parameters: {
      method: 'POST',
      url: 'https://api.hubapi.com/crm/v3/objects/notes',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('={{ $json.notePayload }}'),
      options: { response: { response: { neverError: true } } },
    },
    credentials: {
      httpBearerAuth: newCredential('HubSpot Portal PAT'),
    },
    position: [1020, 280],
  },
  output: [{ id: 'created-note' }],
})

const respondOk = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond 200',
    parameters: {
      respondWith: 'json',
      responseBody: expr('={{ { ok: true } }}'),
      options: { responseCode: 200 },
    },
    position: [1280, 280],
  },
})

const respondError = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond error',
    parameters: {
      respondWith: 'json',
      responseBody: expr(
        '={{ { ok: false, message: $json.message, httpStatus: $json.httpStatus } }}',
      ),
      options: {
        responseCode: expr('={{ Number($json.httpStatus || 400) }}'),
      },
    },
    position: [1020, 520],
  },
  output: [{}],
})

export default workflow('portal-change-order-hubspot-note', 'Portal change order → HubSpot deal note')
  .add(noteSticky)
  .add(webhookPortalCo)
  .to(validateAndBuildNote)
  .to(checkAuthorized.onTrue(hubspotCreateNote.to(respondOk)).onFalse(respondError))
