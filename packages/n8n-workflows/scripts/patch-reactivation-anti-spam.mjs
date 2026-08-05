/**
 * Patches SYS 05 reactivation branch: cooldown, one contact/day, anti-spam stamps.
 * Run: node packages/n8n-workflows/scripts/patch-reactivation-anti-spam.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILTER_INACTIVE_JS = `const contacts = $('Get Inactive Customers').all();
const config = $('Get Config (Reactivation)').first().json;
const staticData = $getWorkflowStaticData('global');
const sentMap = staticData.reactivationSent || {};
const now = Date.now();
const inactiveMs = config.timing.reactivationDays * 24 * 60 * 60 * 1000;
const cooldownMs = (config.timing.reactivationCooldownDays ?? config.timing.reactivationDays) * 24 * 60 * 60 * 1000;

function companyLabel(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    return String(raw.name || raw.company || raw.properties?.name || raw.value || '').trim();
  }
  return String(raw).trim();
}

function hasEmail(email) {
  const e = (email || '').trim();
  return e.includes('@');
}

function parseHubSpotDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function flagIsTrue(value) {
  return String(value || '').toLowerCase() === 'true';
}

function lastSentMs(contactId, p) {
  const fromStatic = sentMap[String(contactId)];
  if (fromStatic && Number.isFinite(fromStatic)) return fromStatic;
  const fromHubSpot = parseHubSpotDate(p.last_reactivation_sent_date);
  return fromHubSpot ? fromHubSpot.getTime() : 0;
}

const eligible = contacts
  .map((c) => {
    const p = c.json.properties || c.json;
    return { contactId: c.json.id, p };
  })
  .filter(({ contactId, p }) => {
    if (!hasEmail(p.email)) return false;
    if (flagIsTrue(p.replied_flag) || flagIsTrue(p.booking_flag)) return false;

    const lastActivity = parseHubSpotDate(p.last_activity_date);
    const isInactive = !lastActivity || (now - lastActivity.getTime()) > inactiveMs;
    if (!isInactive) return false;

    const sentAt = lastSentMs(contactId, p);
    if (sentAt && (now - sentAt) < cooldownMs) return false;

    return true;
  })
  .map(({ contactId, p }) => ({
    contactId,
    firstName: p.firstname || '',
    lastName: p.lastname || '',
    email: (p.email || '').trim(),
    phone: p.phone || '',
    company: companyLabel(p.company),
    lastActivityMs: parseHubSpotDate(p.last_activity_date)?.getTime() ?? 0,
    lastReactivationMs: lastSentMs(contactId, p),
    config,
  }));

if (eligible.length === 0) return [];

eligible.sort((a, b) => {
  if (a.lastReactivationMs !== b.lastReactivationMs) return a.lastReactivationMs - b.lastReactivationMs;
  return a.lastActivityMs - b.lastActivityMs;
});

const pick = eligible[0];
return [{
  json: {
    contactId: pick.contactId,
    firstName: pick.firstName,
    lastName: pick.lastName,
    email: pick.email,
    phone: pick.phone,
    company: pick.company,
    config: pick.config,
  },
}];`;

const PREP_EMAIL_JS = `const items = $input.all();
if (items.length === 0) return [];
const d = items[0].json;
const company = d.company || 'your team';

return [{
  json: {
    contactId: d.contactId,
    to: d.email,
    subject: \`Checking in — \${company}\`,
    html: \`<p>Hi \${d.firstName || 'there'},</p><p>It's been a while since we last worked together, and I wanted to check in.</p><p>A lot has changed in the AI automation space since our last project. We've built some powerful new systems — from AI-powered lead qualification to automated client reporting — that could make a real difference for \${company}.</p><p>Would you be open to a quick 15-minute catch-up? I'd love to hear what's new on your end and share what we've been building.</p><p><a href="\${d.config.owner.calendarLink}" style="color:#0d9488;text-decoration:none;font-weight:600;">Book a 15-minute catch-up</a></p><p>— John<br/>\${d.config.owner.companyName}</p>\`,
    workflowName: 'SYS 05 — Referral & Reactivation Engine',
  },
}];`;

const STAMP_JS = `const prep = $('Prep Reactivation Email').first().json;
const staticData = $getWorkflowStaticData('global');
staticData.reactivationSent = staticData.reactivationSent || {};
staticData.reactivationSent[String(prep.contactId)] = Date.now();

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

return [{
  json: {
    contactId: prep.contactId,
    lastReactivationSentDate: String(today.getTime()),
  },
}];`;

const HUBSPOT_GET_ALL_PARAMS = {
  authentication: 'appToken',
  operation: 'getAll',
  limit: 200,
  additionalFields: {},
  options: {
    properties: [
      'firstname',
      'lastname',
      'email',
      'phone',
      'company',
      'last_activity_date',
      'last_reactivation_sent_date',
      'replied_flag',
      'booking_flag',
    ],
  },
};

const STAMP_NODE = {
  parameters: {
    jsCode: STAMP_JS,
  },
  id: 'sys11-react-stamp',
  name: 'Stamp Reactivation Sent',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1472, 608],
};

const UPDATE_HUBSPOT_NODE = {
  parameters: {
    method: 'PATCH',
    url: '=https://api.hubapi.com/crm/v3/objects/contacts/{{ $json.contactId }}',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'hubspotAppToken',
    sendBody: true,
    specifyBody: 'json',
    jsonBody:
      "={{ JSON.stringify({ properties: { last_reactivation_sent_date: $json.lastReactivationSentDate } }) }}",
    options: {},
  },
  id: 'sys11-react-hubspot-stamp',
  name: 'Update HubSpot Reactivation Date',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4,
  position: [1696, 608],
  credentials: {
    hubspotAppToken: {
      id: 'volH6pGD5psvPC7a',
      name: 'HubSpot App Token account',
    },
  },
  onError: 'continueRegularOutput',
};

function patchWorkflowSection(section) {
  const nodes = section.nodes;
  const connections = section.connections;

  const filterNode = nodes.find((n) => n.id === 'sys11-react-filter');
  const prepEmailNode = nodes.find((n) => n.id === 'sys11-react-email-prep');
  const getCustomersNode = nodes.find((n) => n.id === 'b2077dfe-b522-4723-9662-7906bc19059d');
  const waitNode = nodes.find((n) => n.id === 'sys11-react-wait');

  if (!filterNode || !prepEmailNode || !getCustomersNode || !waitNode) {
    throw new Error('Expected reactivation nodes not found');
  }

  filterNode.parameters.jsCode = FILTER_INACTIVE_JS;
  prepEmailNode.parameters.jsCode = PREP_EMAIL_JS;
  getCustomersNode.parameters = { ...HUBSPOT_GET_ALL_PARAMS };

  if (!nodes.some((n) => n.id === STAMP_NODE.id)) {
    nodes.push(STAMP_NODE, UPDATE_HUBSPOT_NODE);
    waitNode.position = [1920, 608];
    const smsPrep = nodes.find((n) => n.id === 'sys11-react-sms-prep');
    const sms = nodes.find((n) => n.id === 'sys11-react-sms');
    const logPrep = nodes.find((n) => n.id === 'sys11-react-log-prep');
    const log = nodes.find((n) => n.id === 'sys11-react-log');
    if (smsPrep) smsPrep.position = [2144, 608];
    if (sms) sms.position = [2368, 608];
    if (logPrep) logPrep.position = [2592, 608];
    if (log) log.position = [2816, 608];
  } else {
    const stamp = nodes.find((n) => n.id === STAMP_NODE.id);
    const update = nodes.find((n) => n.id === UPDATE_HUBSPOT_NODE.id);
    stamp.parameters.jsCode = STAMP_JS;
    update.parameters = UPDATE_HUBSPOT_NODE.parameters;
  }

  connections['Send Reactivation Email'] = {
    main: [[{ node: 'Stamp Reactivation Sent', type: 'main', index: 0 }]],
  };
  connections['Stamp Reactivation Sent'] = {
    main: [[{ node: 'Update HubSpot Reactivation Date', type: 'main', index: 0 }]],
  };
  connections['Update HubSpot Reactivation Date'] = {
    main: [[{ node: 'Wait 4 Days', type: 'main', index: 0 }]],
  };
}

function patchWorkflow(filePath) {
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  patchWorkflowSection(workflow);
  if (workflow.activeVersion?.nodes) {
    patchWorkflowSection(workflow.activeVersion);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(workflow, null, 2)}\n`);
  console.log('Patched workflow:', filePath);
}

function patchConfig(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.includes('reactivationCooldownDays')) {
    raw = raw.replace(
      /reactivationDays: 60,\\n      healthCheckDays: 14,/g,
      'reactivationDays: 60,\\n      reactivationCooldownDays: 90,\\n      healthCheckDays: 14,',
    );
  }
  fs.writeFileSync(filePath, raw);
  console.log('Patched config:', filePath);
}

patchWorkflow(
  path.join(root, '05_client-success/SYS 05 — Referral and Reactivation Engine.json'),
);
patchConfig(path.join(root, '_config/CONFIG — Global Settings.json'));
