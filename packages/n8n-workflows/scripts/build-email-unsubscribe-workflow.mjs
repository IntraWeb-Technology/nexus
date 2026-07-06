/**
 * Builds SYS 05 — Email Unsubscribe Handler workflow JSON from local code files.
 * Run: node packages/n8n-workflows/scripts/build-email-unsubscribe-workflow.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.resolve(__dirname, '..')
const CS = path.join(PKG, '05_client-success')

function readJs(name) {
  return fs.readFileSync(path.join(CS, name), 'utf8')
}

function readCodeWithHmac(name) {
  const hmac = fs.readFileSync(path.join(PKG, '_shared/_hmac-sha256-hex.js'), 'utf8')
  return `${hmac}\n${readJs(name)}`
}

const CONFIG_ID = '1eTTVoSFSlSPvZV4'
const LOG_ID = '1qQFLOSHZsS9JPKP'
const HUBSPOT_CRED = {
  hubspotAppToken: {
    id: 'volH6pGD5psvPC7a',
    name: 'HubSpot App Token account',
  },
}

const outPath = path.join(CS, 'SYS 05 — Email Unsubscribe Handler.json')
let existingId = ''
if (fs.existsSync(outPath)) {
  try {
    existingId = JSON.parse(fs.readFileSync(outPath, 'utf8')).id || ''
  } catch {
    existingId = ''
  }
}

const workflow = {
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  id: existingId || '',
  name: 'SYS 05 — Email Unsubscribe Handler',
  description:
    'GET/POST /webhook/email-unsubscribe — validates signed link, sets HubSpot email_opt_out, logs note + automations sheet.',
  active: true,
  isArchived: false,
  nodes: [
    {
      parameters: {
        content:
          '## Email Unsubscribe\n\nSigned link from SW: Send Email via Resend footer.\n\n`?email=...&sig=HMAC-SHA256(webhookSecret, email)`\n\nSets `email_opt_out=true`, HubSpot note, automations log.',
        height: 200,
        width: 420,
        color: 5,
      },
      id: 'note-unsub',
      name: 'Note — About this workflow',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1.3,
      position: [80, 80],
    },
    {
      parameters: {
        path: 'email-unsubscribe',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'unsub-webhook',
      name: 'Email Unsubscribe Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [280, 360],
      webhookId: 'iw-email-unsubscribe-webhook',
    },
    {
      parameters: {
        source: 'database',
        workflowId: { __rl: true, value: CONFIG_ID, mode: 'id' },
      },
      id: 'unsub-config',
      name: 'Get Config',
      type: 'n8n-nodes-base.executeWorkflow',
      typeVersion: 1.3,
      position: [500, 360],
    },
    {
      parameters: { jsCode: readCodeWithHmac('_email-unsubscribe-validate.js') },
      id: 'unsub-validate',
      name: 'Validate Unsubscribe Link',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [720, 360],
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
          conditions: [
            {
              id: 'unsub-valid',
              leftValue: '={{ $json.valid }}',
              operator: { type: 'boolean', operation: 'true' },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      id: 'unsub-if-valid',
      name: 'Valid Link?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [940, 360],
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'hubspotAppToken',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
          "={{ JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: $json.email }] }], properties: ['email', 'firstname', 'lastname', 'email_opt_out'], limit: 1 }) }}",
        options: {},
      },
      id: 'unsub-search',
      name: 'Search HubSpot Contact',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [1160, 280],
      credentials: HUBSPOT_CRED,
    },
    {
      parameters: { jsCode: readJs('_email-unsubscribe-extract.js') },
      id: 'unsub-extract',
      name: 'Extract Contact',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1380, 280],
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
          conditions: [
            {
              id: 'unsub-found',
              leftValue: '={{ $json.contactFound }}',
              operator: { type: 'boolean', operation: 'true' },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      id: 'unsub-if-found',
      name: 'Contact Found?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [1600, 280],
    },
    {
      parameters: {
        method: 'PATCH',
        url: '=https://api.hubapi.com/crm/v3/objects/contacts/{{ $json.contactId }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'hubspotAppToken',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
          '={{ JSON.stringify({ properties: { email_opt_out: "true" } }) }}',
        options: {},
      },
      id: 'unsub-patch',
      name: 'Mark Opted Out in HubSpot',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [1820, 200],
      credentials: HUBSPOT_CRED,
      onError: 'continueRegularOutput',
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://api.hubapi.com/crm/v3/objects/notes',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'hubspotAppToken',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
          "={{ JSON.stringify({ properties: { hs_note_body: `Contact unsubscribed from marketing/reactivation emails via email link on ${new Date().toISOString()}.`, hs_timestamp: String(Date.now()) }, associations: [{ to: { id: $('Extract Contact').first().json.contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }] }) }}",
        options: {},
      },
      id: 'unsub-note',
      name: 'Log HubSpot Note',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [2040, 200],
      credentials: HUBSPOT_CRED,
      onError: 'continueRegularOutput',
    },
    {
      parameters: { jsCode: readJs('_email-unsubscribe-prep-log.js') },
      id: 'unsub-prep-log',
      name: 'Prep Automations Log',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2260, 280],
    },
    {
      parameters: {
        source: 'database',
        workflowId: { __rl: true, value: LOG_ID, mode: 'id' },
        workflowInputs: {
          mappingMode: 'defineBelow',
          value: {
            workflowName: '={{ $json.workflowName }}',
            contactName: '={{ $json.contactName }}',
            phone: '={{ $json.phone }}',
            eventType: '={{ $json.eventType }}',
            status: '={{ $json.status }}',
            notes: '={{ $json.notes }}',
          },
        },
      },
      id: 'unsub-log',
      name: 'Log to Sheet',
      type: 'n8n-nodes-base.executeWorkflow',
      typeVersion: 1.3,
      position: [2480, 280],
    },
    {
      parameters: { jsCode: readJs('_email-unsubscribe-response.js') },
      id: 'unsub-response-prep',
      name: 'Prep Response HTML',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2700, 360],
    },
    {
      parameters: {
        respondWith: 'text',
        responseBody: '={{ $json.html }}',
        options: {
          responseHeaders: {
            entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }],
          },
        },
      },
      id: 'unsub-respond',
      name: 'Respond to Webhook',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [2920, 360],
    },
  ],
  connections: {
    'Email Unsubscribe Webhook': {
      main: [[{ node: 'Get Config', type: 'main', index: 0 }]],
    },
    'Get Config': {
      main: [[{ node: 'Validate Unsubscribe Link', type: 'main', index: 0 }]],
    },
    'Validate Unsubscribe Link': {
      main: [[{ node: 'Valid Link?', type: 'main', index: 0 }]],
    },
    'Valid Link?': {
      main: [
        [
          { node: 'Search HubSpot Contact', type: 'main', index: 0 },
        ],
        [
          { node: 'Prep Response HTML', type: 'main', index: 0 },
        ],
      ],
    },
    'Search HubSpot Contact': {
      main: [[{ node: 'Extract Contact', type: 'main', index: 0 }]],
    },
    'Extract Contact': {
      main: [[{ node: 'Contact Found?', type: 'main', index: 0 }]],
    },
    'Contact Found?': {
      main: [
        [
          { node: 'Mark Opted Out in HubSpot', type: 'main', index: 0 },
        ],
        [
          { node: 'Prep Automations Log', type: 'main', index: 0 },
        ],
      ],
    },
    'Mark Opted Out in HubSpot': {
      main: [[{ node: 'Log HubSpot Note', type: 'main', index: 0 }]],
    },
    'Log HubSpot Note': {
      main: [[{ node: 'Prep Automations Log', type: 'main', index: 0 }]],
    },
    'Prep Automations Log': {
      main: [[{ node: 'Log to Sheet', type: 'main', index: 0 }]],
    },
    'Log to Sheet': {
      main: [[{ node: 'Prep Response HTML', type: 'main', index: 0 }]],
    },
    'Prep Response HTML': {
      main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'America/New_York',
  },
  staticData: null,
  pinData: {},
}

fs.writeFileSync(outPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8')
console.log('Wrote', outPath)
