/**
 * Builds SYS 05 — Data Deletion Handler workflow JSON from local code files.
 * Run: node packages/n8n-workflows/scripts/build-data-deletion-workflow.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.resolve(__dirname, '..')
const CS = path.join(PKG, '05_client-success')
const RESEND_SW_ID = 'FF6VOLCcRxI4uNYD'

function readJs(name) {
  return fs.readFileSync(path.join(CS, name), 'utf8')
}

const CONFIG_ID = '1eTTVoSFSlSPvZV4'
const LOG_ID = '1qQFLOSHZsS9JPKP'

const outPath = path.join(CS, 'SYS 05 — Data Deletion Handler.json')
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
  name: 'SYS 05 — Data Deletion Handler',
  description:
    'POST /webhook/data-deletion-confirmed — runs portal execute-deletion API, emails user, logs automations.',
  active: true,
  isArchived: false,
  nodes: [
    {
      parameters: {
        content:
          '## Data Deletion Handler\n\nTriggered after email verification on intrawebtech.com/data-deletion.\n\nCalls portal execute-deletion, sends completion email, logs to automations sheet.',
        height: 180,
        width: 420,
        color: 5,
      },
      id: 'note-del',
      name: 'Note — About this workflow',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1.3,
      position: [80, 80],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'data-deletion-confirmed',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'del-webhook',
      name: 'Data Deletion Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [280, 360],
      webhookId: 'iw-data-deletion-confirmed',
    },
    {
      parameters: {
        source: 'database',
        workflowId: { __rl: true, value: CONFIG_ID, mode: 'id' },
      },
      id: 'del-config',
      name: 'Get Config',
      type: 'n8n-nodes-base.executeWorkflow',
      typeVersion: 1.3,
      position: [500, 360],
    },
    {
      parameters: { jsCode: readJs('_data-deletion-validate.js') },
      id: 'del-validate',
      name: 'Validate Payload',
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
              id: 'del-valid',
              leftValue: '={{ $json.valid }}',
              operator: { type: 'boolean', operation: 'true' },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      id: 'del-if-valid',
      name: 'Valid Payload?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [940, 360],
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://dashboard.intrawebtech.com/api/internal/privacy/execute-deletion',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'x-intrawebtech-secret',
              value: '={{ $("Get Config").first().json.secrets?.webhookSecret }}',
            },
            { name: 'Content-Type', value: 'application/json' },
          ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
          '={{ JSON.stringify({ request_id: $json.request_id, email: $json.email }) }}',
        options: { timeout: 120000 },
      },
      id: 'del-execute',
      name: 'Execute Deletion',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [1160, 280],
      onError: 'continueRegularOutput',
    },
    {
      parameters: {
        source: 'database',
        workflowId: { __rl: true, value: LOG_ID, mode: 'id' },
        workflowInputs: {
          mappingMode: 'defineBelow',
          value: {
            workflowName: 'SYS 05 — Data Deletion Handler',
            contactName: '={{ $("Validate Payload").first().json.email }}',
            phone: '',
            eventType: 'data_deletion_completed',
            status: '={{ $("Execute Deletion").first().json.status || "unknown" }}',
            notes:
              '={{ "tier=" + ($("Execute Deletion").first().json.tier || "n/a") + "; request=" + $("Validate Payload").first().json.request_id }}',
          },
        },
      },
      id: 'del-log',
      name: 'Log to Automations',
      type: 'n8n-nodes-base.executeWorkflow',
      typeVersion: 1.3,
      position: [1380, 280],
    },
    {
      parameters: { jsCode: readJs('_data-deletion-response.js') },
      id: 'del-prep-email',
      name: 'Prep Completion Email',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1380, 440],
    },
    {
      parameters: {
        source: 'database',
        workflowId: { __rl: true, value: RESEND_SW_ID, mode: 'id' },
        workflowInputs: {
          mappingMode: 'defineBelow',
          value: {
            to: '={{ $("Prep Completion Email").first().json.to }}',
            subject: '={{ $("Prep Completion Email").first().json.subject }}',
            html: '={{ $("Prep Completion Email").first().json.html }}',
            workflowName: 'SYS 05 — Data Deletion Handler',
          },
        },
      },
      id: 'del-email',
      name: 'Send Completion Email',
      type: 'n8n-nodes-base.executeWorkflow',
      typeVersion: 1.3,
      position: [1600, 360],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ { ok: true, status: $("Execute Deletion").first().json.status } }}',
        options: {},
      },
      id: 'del-respond',
      name: 'Respond to Webhook',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1820, 360],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ { ok: false, message: $json.message || "Unauthorized" } }}',
        options: { responseCode: 401 },
      },
      id: 'del-respond-bad',
      name: 'Respond Unauthorized',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1160, 480],
    },
  ],
  connections: {
    'Data Deletion Webhook': {
      main: [[{ node: 'Get Config', type: 'main', index: 0 }]],
    },
    'Get Config': {
      main: [[{ node: 'Validate Payload', type: 'main', index: 0 }]],
    },
    'Validate Payload': {
      main: [[{ node: 'Valid Payload?', type: 'main', index: 0 }]],
    },
    'Valid Payload?': {
      main: [
        [{ node: 'Execute Deletion', type: 'main', index: 0 }],
        [{ node: 'Respond Unauthorized', type: 'main', index: 0 }],
      ],
    },
    'Execute Deletion': {
      main: [[{ node: 'Log to Automations', type: 'main', index: 0 }]],
    },
    'Log to Automations': {
      main: [[{ node: 'Prep Completion Email', type: 'main', index: 0 }]],
    },
    'Prep Completion Email': {
      main: [[{ node: 'Send Completion Email', type: 'main', index: 0 }]],
    },
    'Send Completion Email': {
      main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
    },
  },
  settings: { executionOrder: 'v1' },
}

fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2))
console.log('Wrote', outPath)
