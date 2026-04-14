import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  "../packages/n8n-workflows/03_sales/SYS 03 — Qualified to Buy → Portal + Clerk.json",
);

const now = new Date().toISOString();

const prepContextCode = `const w = $('Qualified to Buy Webhook').first().json;
const raw = w.body ?? w;
const dealId = String(raw.id || '').trim();
const props = raw.properties || {};
const config = $('Get Config').first().json;
if (!dealId) throw new Error('Missing deal id on webhook body');
return [{ json: { dealId, props, config } }];`;

const buildProvisionCode = `const deal = $json;
const ctx = $('Prep Context').first().json;
const config = ctx.config;
const props = deal.properties || ctx.props || {};
const assoc = deal.associations?.contacts?.results || [];
const hubspotContactId = assoc[0]?.id ? String(assoc[0].id) : '';
const email = (props.contact_email || '').trim().toLowerCase();
const first = (props.contact_firstname || '').trim();
const last = (props.contact_lastname || '').trim();
const phone = (props.contact_phone || '').trim();
const companyName = (props.dealname || props.company || '').trim() || 'Client';
const dealId = ctx.dealId;
if (!hubspotContactId) {
  throw new Error('Deal has no associated contact. Associate a primary contact in HubSpot before this stage.');
}
if (!email) {
  throw new Error('Missing contact_email on deal. Populate deal contact_email (or sync from contact) before this stage.');
}
const tier = (props.tier || '').toLowerCase();
const plan = tier === 'growth' ? 'growth' : tier === 'custom' ? 'custom' : 'starter';
const slugBase = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
const project_slug = (slugBase + '-' + dealId).slice(0, 48);
const portalBase = (config.owner.portalN8nWebhookUrl || '').trim();
const portalUrl = portalBase
  ? (portalBase.includes('/api/webhook/n8n') ? portalBase : portalBase.replace(/\\/$/, '') + '/api/webhook/n8n')
  : '';
const signUp = (config.owner.portalSignUpUrl || '').trim();
const today = new Date().toISOString().slice(0, 10);
const provisionBody = {
  action: 'provision_client',
  project_slug,
  data: {
    name: (first + ' ' + last).trim() || companyName,
    email,
    phone: phone || undefined,
    hubspot_contact_id: hubspotContactId,
    hubspot_deal_id: dealId,
    plan,
    start_date: today,
    engagement_phase: 'qualified',
  },
};
return [{
  json: {
    portalUrl,
    signUp,
    provisionBody,
    inviteEmail: email,
  },
}];`;

const afterPortalCode = `const portal = $('POST Portal provision_client').first().json;
const bp = $('Build provision payload').first().json;
const skipInvite = !!portal.idempotent;
return [{ json: { ...bp, skipInvite, portal } }];`;

const finalSkipCode = `const bp = $('After portal response').first().json;
let clerk = 'skipped_user_exists';
if (bp.skipInvite) clerk = 'skipped_portal_idempotent';
return [{ json: { ok: true, clerk, portal: bp.portal, inviteEmail: bp.inviteEmail } }];`;

const finalInviteCode = `const bp = $('After portal response').first().json;
const inv = $json;
return [{ json: { ok: true, clerk: 'invited', invitation_id: inv.id || null, portal: bp.portal, inviteEmail: bp.inviteEmail } }];`;

const wf = {
  updatedAt: now,
  createdAt: now,
  id: "qTbPortalClerk01",
  name: "SYS 03 — Qualified to Buy → Portal + Clerk",
  description:
    "HubSpot dealstage Qualified to buy (SYS 00 route hubspot-deal-qualified-portal): provision_client on the portal, then Clerk invitation when no user exists.",
  active: false,
  isArchived: false,
  nodes: [
    {
      parameters: {
        content:
          "## Qualified → Portal + Clerk\n\n**Trigger:** `POST /webhook/hubspot-deal-qualified-portal` (from **SYS 00** after dealstage matches qualified union).\n\n**Env (n8n):** `WEBHOOK_SECRET`, `CLERK_SECRET_KEY`, `PORTAL_WEBHOOK_URL` (full URL to `…/api/webhook/n8n` if CONFIG `owner.portalN8nWebhookUrl` is empty), `PORTAL_SIGNUP_REDIRECT_URL` (if CONFIG `owner.portalSignUpUrl` is empty).\n\n**CONFIG:** `hubspot.dealStageIds.qualifiedToBuy` (comma IDs) + built-in `qualifiedtobuy`; union with `leadQualified`. `owner.portalN8nWebhookUrl`, `owner.portalSignUpUrl`.\n\n**HubSpot:** Deal must have an associated contact and `contact_email` on deal properties for v1.",
        height: 420,
        width: 520,
        color: 5,
      },
      id: "note-qualified",
      name: "Note — About",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1.3,
      position: [60, 60],
    },
    {
      parameters: {
        httpMethod: "POST",
        path: "hubspot-deal-qualified-portal",
        responseMode: "lastNode",
        options: {},
      },
      id: "q-webhook",
      name: "Qualified to Buy Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [280, 300],
      webhookId: "a7c3e9b1-2d4f-4a8e-9c1b-qualified-portal",
    },
    {
      parameters: {
        workflowId: {
          __rl: true,
          value: "1eTTVoSFSlSPvZV4",
          mode: "id",
        },
        workflowInputs: {
          mappingMode: "defineBelow",
          value: {},
        },
        options: {},
      },
      id: "q-get-config",
      name: "Get Config",
      type: "n8n-nodes-base.executeWorkflow",
      typeVersion: 1.3,
      position: [500, 300],
    },
    {
      parameters: { jsCode: prepContextCode },
      id: "q-prep",
      name: "Prep Context",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [720, 300],
    },
    {
      parameters: {
        method: "GET",
        url: "=https://api.hubapi.com/crm/v3/objects/deals/{{ $json.dealId }}?associations=contacts&properties=dealname,tier,contact_email,contact_firstname,contact_lastname,contact_phone,amount,closedate,company",
        authentication: "predefinedCredentialType",
        nodeCredentialType: "hubspotAppToken",
        options: {},
      },
      id: "q-fetch-deal",
      name: "Fetch Deal From HubSpot",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [940, 300],
      credentials: {
        hubspotAppToken: {
          id: "volH6pGD5psvPC7a",
          name: "HubSpot App Token account",
        },
      },
    },
    {
      parameters: { jsCode: buildProvisionCode },
      id: "q-build",
      name: "Build provision payload",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1160, 300],
    },
    {
      parameters: {
        method: "POST",
        url: "={{ ($json.portalUrl && String($json.portalUrl).trim()) || $env.PORTAL_WEBHOOK_URL }}",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "x-intrawebtech-secret",
              value: "={{ $env.WEBHOOK_SECRET }}",
            },
            { name: "Content-Type", value: "application/json" },
          ],
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify($json.provisionBody) }}",
        options: {},
      },
      id: "q-post-portal",
      name: "POST Portal provision_client",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1380, 300],
    },
    {
      parameters: { jsCode: afterPortalCode },
      id: "q-after-portal",
      name: "After portal response",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1600, 300],
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
          },
          conditions: [
            {
              id: "skip-inv",
              leftValue: "={{ $json.skipInvite }}",
              rightValue: true,
              operator: { type: "boolean", operation: "equals" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "q-if-skip",
      name: "Skip Clerk invite?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [1820, 300],
    },
    {
      parameters: {
        url: "={{ 'https://api.clerk.com/v1/users?limit=5&email_address[]=' + encodeURIComponent($json.inviteEmail) }}",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: "=Bearer {{ $env.CLERK_SECRET_KEY }}",
            },
          ],
        },
        options: {},
      },
      id: "q-clerk-list",
      name: "Clerk list users by email",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [2040, 180],
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
          },
          conditions: [
            {
              id: "has-users",
              leftValue: "={{ ($json.data || []).length }}",
              rightValue: 0,
              operator: { type: "number", operation: "gt" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "q-if-user",
      name: "Clerk user already exists?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [2260, 180],
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.clerk.com/v1/invitations",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: "=Bearer {{ $env.CLERK_SECRET_KEY }}",
            },
            { name: "Content-Type", value: "application/json" },
          ],
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          "={{ JSON.stringify({ email_address: $('After portal response').first().json.inviteEmail, redirect_url: (($('After portal response').first().json.signUp || '').trim() || $env.PORTAL_SIGNUP_REDIRECT_URL || '').trim() }) }}",
        options: {},
      },
      id: "q-clerk-invite",
      name: "Clerk create invitation",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [2480, 260],
    },
    {
      parameters: { jsCode: finalSkipCode },
      id: "q-final-skip",
      name: "Final response (skip / existing)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [2700, 120],
    },
    {
      parameters: { jsCode: finalInviteCode },
      id: "q-final-invite",
      name: "Final response (after invite)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [2700, 300],
    },
  ],
  connections: {
    "Qualified to Buy Webhook": {
      main: [[{ node: "Get Config", type: "main", index: 0 }]],
    },
    "Get Config": {
      main: [[{ node: "Prep Context", type: "main", index: 0 }]],
    },
    "Prep Context": {
      main: [[{ node: "Fetch Deal From HubSpot", type: "main", index: 0 }]],
    },
    "Fetch Deal From HubSpot": {
      main: [[{ node: "Build provision payload", type: "main", index: 0 }]],
    },
    "Build provision payload": {
      main: [[{ node: "POST Portal provision_client", type: "main", index: 0 }]],
    },
    "POST Portal provision_client": {
      main: [[{ node: "After portal response", type: "main", index: 0 }]],
    },
    "After portal response": {
      main: [[{ node: "Skip Clerk invite?", type: "main", index: 0 }]],
    },
    "Skip Clerk invite?": {
      main: [
        [{ node: "Final response (skip / existing)", type: "main", index: 0 }],
        [{ node: "Clerk list users by email", type: "main", index: 0 }],
      ],
    },
    "Clerk list users by email": {
      main: [[{ node: "Clerk user already exists?", type: "main", index: 0 }]],
    },
    "Clerk user already exists?": {
      main: [
        [{ node: "Final response (skip / existing)", type: "main", index: 0 }],
        [{ node: "Clerk create invitation", type: "main", index: 0 }],
      ],
    },
    "Clerk create invitation": {
      main: [[{ node: "Final response (after invite)", type: "main", index: 0 }]],
    },
  },
  settings: {
    executionOrder: "v1",
    callerPolicy: "workflowsFromSameOwner",
    availableInMCP: false,
    binaryMode: "separate",
  },
  staticData: null,
  meta: { templateCredsSetupCompleted: false },
  pinData: {},
  versionId: "qual-portal-v1",
  activeVersionId: null,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(wf, null, 2));
console.log("wrote", outPath);
