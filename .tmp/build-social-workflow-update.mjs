import fs from 'fs';

const RUNS_TABLE_ID = 'xFUUGHuJD0YMJeiD';
const DRAFTS_TABLE_ID = 'g3axXQ2YWW4MFb9r';
const CHAT_ALERT_WF = 'PGf6jPoWtxSPlr0h';
const TZ = 'America/New_York';

const src = JSON.parse(
  fs.readFileSync(
    'C:/Users/jschi/.cursor/projects/e-IntraWeb-Technologies-10-Repos-nexus/agent-tools/c0db72ac-2010-489e-b8f5-0a972de41a9d.txt',
    'utf8',
  ),
);
const wf = src.data;

// Remove video nodes if still present
const removeNames = new Set(['If', 'AI Video Prompt Agent', 'Generate a video', 'Merge']);
wf.nodes = wf.nodes.filter((n) => !removeNames.has(n.name));

function node(name) {
  const n = wf.nodes.find((x) => x.name === name);
  if (!n) throw new Error(`Missing node: ${name}`);
  return n;
}

function upsertNode(nodeObj) {
  const idx = wf.nodes.findIndex((n) => n.name === nodeObj.name);
  if (idx >= 0) wf.nodes[idx] = { ...wf.nodes[idx], ...nodeObj };
  else wf.nodes.push(nodeObj);
}

// --- Updated code nodes ---
node('Topic').parameters.jsCode = `const input = $input.first()?.json || {};
const postType = input.postType || 'primary';
const pipelineSlot = input.pipelineSlot || 'publish';
const publishNow = input.publishNow === true;
if (input.topStories?.length) return [{ json: { ...input } }];
const TOPICS = ['Breaking Tech News','AI News','Software Engineering','System Design','Architecture','Cloud','Cybersecurity','Programming Languages','Developer Tools','Open Source','GitHub Trending','Tech Companies','Startups','Engineering Career','Debugging','Performance','DevOps','Databases','Frontend','Backend','Testing','Productivity','History of Computing','Engineering Opinion','Tool Spotlight','Weekly Roundup'];
const ENGAGE_TOPICS = ['Engineering Opinion','Productivity','Tool Spotlight','Testing','Debugging'];
const DEEP_TOPICS = ['System Design','Architecture','Backend','DevOps','Performance','Databases','Cloud'];
const pool = postType === 'engage' ? ENGAGE_TOPICS : postType === 'deep' ? DEEP_TOPICS : TOPICS;
const staticData = $getWorkflowStaticData('global');
if (!Array.isArray(staticData.recentTopics)) staticData.recentTopics = [];
const recent = new Set(staticData.recentTopics.slice(-8));
let candidates = pool.filter((t) => !recent.has(t));
if (!candidates.length) candidates = [...pool];
const topic = candidates[Math.floor(Math.random() * candidates.length)];
staticData.recentTopics.push(topic);
if (staticData.recentTopics.length > 16) staticData.recentTopics = staticData.recentTopics.slice(-16);
return [{ json: { topic, postType, pipelineSlot, publishNow, skipResearch: postType === 'engage' || postType === 'deep', pickedAt: new Date().toISOString() } }];`;

node('Collect and Score Sources').parameters.jsCode = fs.readFileSync(new URL('./collect-score-sources.js', import.meta.url), 'utf8');
node('Format Research').parameters.jsCode = fs.readFileSync(new URL('./format-research.js', import.meta.url), 'utf8');
node('Parse Post JSON').parameters.jsCode = fs.readFileSync(new URL('./parse-post-json.js', import.meta.url), 'utf8');
node('Select Best Draft').parameters.jsCode = fs.readFileSync(new URL('./select-best-draft.js', import.meta.url), 'utf8');
node('Load Primary Draft').parameters.jsCode = fs.readFileSync(new URL('./load-primary-draft.js', import.meta.url), 'utf8');
node('Build All Channel Posts').parameters.jsCode = fs.readFileSync(new URL('./build-all-channel-posts.js', import.meta.url), 'utf8');

// AI Research prompt
const researchPrompt = `={{ \`You are a professional news researcher. Find 6-8 recent news stories about this topic from the past 48 hours.

TOPIC: \${$json.topic}

Trending signals from our collectors (use as hints, verify with search):
\${($json.topStories || []).slice(0, 8).map((s, i) => \`\${i + 1}. [\${s.source}] \${s.title} — \${s.link}\`).join('\\n') || 'No collector hints available.'}

For EACH story use this exact format:
---
### STORY N
Title: [headline]
Date: [when published]
Summary: [2-3 sentences]
Why it matters: [1-2 sentences]
Source URL: https://full-article-url-here
Extra URLs: [optional or "none"]

CRITICAL: Source URL must be a full https:// URL to a specific article or video page. Never use bracket citation numbers like [1] or [10]. Never use a homepage.\` }}`;
node('AI Research').parameters.messages.message[0].content = researchPrompt;

// Schedule timezone
for (const name of ['7AM Prep', '8AM Primary', '12PM Engage', '530PM Deep']) {
  node(name).parameters.timezone = TZ;
}

// Postiz settings
for (const name of ['Postiz', 'Postiz - Post All Channels']) {
  const n = node(name);
  n.retryOnFail = true;
  n.maxTries = 3;
  n.waitBetweenTries = 5000;
  n.onError = 'continueErrorOutput';
}

// Ensure helper nodes exist first
const helperNodes = [
  {
    id: 'skip-research-if', name: 'Skip Research?', type: 'n8n-nodes-base.if', typeVersion: 2.3,
    position: [1100, 96],
    parameters: { conditions: { combinator: 'and', conditions: [{ id: 'skip-research-check', leftValue: '={{ $json.skipResearch }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' }, rightValue: true }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, options: {} },
  },
  {
    id: 'needs-image-if', name: 'Needs Image?', type: 'n8n-nodes-base.if', typeVersion: 2.3,
    position: [2600, 336],
    parameters: { conditions: { combinator: 'and', conditions: [{ id: 'needs-image-check', leftValue: '={{ $json.postType }}', operator: { name: 'filter.operator.notEquals', operation: 'notEquals', type: 'string' }, rightValue: 'engage' }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, options: {} },
  },
  {
    id: 'validate-draft-node', name: 'Validate Draft', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [720, 320],
    parameters: { jsCode: fs.readFileSync(new URL('./validate-draft.js', import.meta.url), 'utf8') },
  },
  {
    id: 'acquire-mutex-node', name: 'Acquire Mutex', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [400, 208],
    parameters: { jsCode: fs.readFileSync(new URL('./acquire-mutex.js', import.meta.url), 'utf8') },
  },
  {
    id: 'mutex-blocked-if', name: 'Mutex Blocked?', type: 'n8n-nodes-base.if', typeVersion: 2.3,
    position: [620, 208],
    parameters: { conditions: { combinator: 'and', conditions: [{ id: 'mutex-check', leftValue: '={{ $json.mutexBlocked }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' }, rightValue: true }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, options: {} },
  },
  {
    id: 'route-slot-switch', name: 'Route Slot', type: 'n8n-nodes-base.switch', typeVersion: 3.2,
    position: [840, 208],
    parameters: {
      mode: 'rules',
      options: { fallbackOutput: 'extra', renameFallbackOutput: 'primaryPublish' },
      rules: {
        values: [
          { conditions: { combinator: 'and', conditions: [{ id: 'route-prep', leftValue: '={{ $json.pipelineSlot }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'string' }, rightValue: 'prep' }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, renameOutput: true, outputKey: 'prep' },
          { conditions: { combinator: 'or', conditions: [{ id: 'route-engage', leftValue: '={{ $json.postType }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'string' }, rightValue: 'engage' }, { id: 'route-deep', leftValue: '={{ $json.postType }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'string' }, rightValue: 'deep' }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, renameOutput: true, outputKey: 'engageDeep' },
        ],
      },
    },
  },
  {
    id: 'draft-still-valid-if', name: 'Draft Still Valid?', type: 'n8n-nodes-base.if', typeVersion: 2.3,
    position: [960, 320],
    parameters: { conditions: { combinator: 'and', conditions: [{ id: 'draft-valid-check', leftValue: '={{ $json.hasDraft }}', operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' }, rightValue: true }], options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 } }, options: {} },
  },
  {
    id: 'log-skipped-node', name: 'Log Skipped Run', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [840, 80],
    parameters: { jsCode: fs.readFileSync(new URL('./log-skipped.js', import.meta.url), 'utf8') },
  },
  {
    id: 'log-run-outcome-node', name: 'Log Run Outcome', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [4584, 336],
    parameters: { jsCode: fs.readFileSync(new URL('./log-run-outcome.js', import.meta.url), 'utf8') },
  },
  {
    id: 'log-run-table-node', name: 'Store Run Log', type: 'n8n-nodes-base.dataTable', typeVersion: 1.1,
    position: [5024, 336],
    parameters: {
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: RUNS_TABLE_ID },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          execution_id: '={{ $json.execution_id }}',
          slot: '={{ $json.slot }}',
          post_type: '={{ $json.post_type }}',
          status: '={{ $json.status }}',
          headline: '={{ $json.headline }}',
          topic: '={{ $json.topic }}',
          postiz_id: '={{ $json.postiz_id }}',
          error_message: '={{ $json.error_message }}',
          duration_ms: '={{ $json.duration_ms }}',
          created_at: '={{ $json.created_at }}',
        },
      },
    },
  },
  {
    id: 'release-mutex-node', name: 'Release Mutex', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [5248, 336],
    parameters: { jsCode: "const staticData = $getWorkflowStaticData('global'); staticData.runningSince = 0; return $input.all();" },
  },
  {
    id: 'structured-output-parser', name: 'Structured Output Parser', type: '@n8n/n8n-nodes-langchain.outputParserStructured', typeVersion: 1.2,
    position: [1648, 280],
    parameters: { jsonSchemaExample: '{\n  "drafts": [\n    {\n      "headline": "Example headline",\n      "message": "Example message",\n      "short_message": "Short message",\n      "story_index": 1,\n      "score": 85\n    }\n  ]\n}' },
  },
  {
    id: 'prep-upload-failed', name: 'Mark Upload Failed', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [3920, 480],
    parameters: { jsCode: fs.readFileSync(new URL('./mark-upload-failed.js', import.meta.url), 'utf8') },
  },
  {
    id: 'prep-notify-error', name: 'Prep Error Alert', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [4368, 520],
    parameters: { jsCode: fs.readFileSync(new URL('./prep-error-alert.js', import.meta.url), 'utf8') },
  },
  {
    id: 'notify-error-node', name: 'Notify Error', type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.3,
    position: [4584, 520],
    parameters: { source: 'database', workflowId: { __rl: true, mode: 'id', value: CHAT_ALERT_WF } },
  },
];

for (const n of helperNodes) upsertNode(n);

// Fix data table __rl
for (const name of ["Get Today's Draft", 'Store Draft in Table', 'Store Run Log']) {
  const n = node(name);
  n.parameters.dataTableId = { __rl: true, mode: 'id', value: name === 'Store Run Log' ? RUNS_TABLE_ID : DRAFTS_TABLE_ID };
}

// Connections
wf.connections = {
  '7AM Prep': { main: [[{ node: 'Init Prep Slot', type: 'main', index: 0 }]] },
  '8AM Primary': { main: [[{ node: 'Init Primary Slot', type: 'main', index: 0 }]] },
  '12PM Engage': { main: [[{ node: 'Init Engage Slot', type: 'main', index: 0 }]] },
  '530PM Deep': { main: [[{ node: 'Init Deep Slot', type: 'main', index: 0 }]] },
  'Init Prep Slot': { main: [[{ node: 'Acquire Mutex', type: 'main', index: 0 }]] },
  'Init Primary Slot': { main: [[{ node: 'Acquire Mutex', type: 'main', index: 0 }]] },
  'Init Engage Slot': { main: [[{ node: 'Acquire Mutex', type: 'main', index: 0 }]] },
  'Init Deep Slot': { main: [[{ node: 'Acquire Mutex', type: 'main', index: 0 }]] },
  'Acquire Mutex': { main: [[{ node: 'Mutex Blocked?', type: 'main', index: 0 }]] },
  'Mutex Blocked?': {
    main: [
      [{ node: 'Log Skipped Run', type: 'main', index: 0 }],
      [{ node: 'Route Slot', type: 'main', index: 0 }],
    ],
  },
  'Log Skipped Run': { main: [[{ node: 'Store Run Log', type: 'main', index: 0 }]] },
  'Route Slot': {
    main: [
      [{ node: 'Collect and Score Sources', type: 'main', index: 0 }],
      [{ node: 'Topic', type: 'main', index: 0 }],
      [{ node: "Get Today's Draft", type: 'main', index: 0 }],
    ],
  },
  "Get Today's Draft": { main: [[{ node: 'Load Primary Draft', type: 'main', index: 0 }]] },
  'Load Primary Draft': { main: [[{ node: 'Has Saved Draft?', type: 'main', index: 0 }]] },
  'Has Saved Draft?': {
    main: [
      [{ node: 'Validate Draft', type: 'main', index: 0 }],
      [{ node: 'Collect and Score Sources', type: 'main', index: 0 }],
    ],
  },
  'Validate Draft': { main: [[{ node: 'Draft Still Valid?', type: 'main', index: 0 }]] },
  'Draft Still Valid?': {
    main: [
      [{ node: 'Needs Image?', type: 'main', index: 0 }],
      [{ node: 'Collect and Score Sources', type: 'main', index: 0 }],
    ],
  },
  'Collect and Score Sources': { main: [[{ node: 'Topic', type: 'main', index: 0 }]] },
  Topic: { main: [[{ node: 'Skip Research?', type: 'main', index: 0 }]] },
  'Skip Research?': {
    main: [
      [{ node: 'AI Writer', type: 'main', index: 0 }],
      [{ node: 'AI Research', type: 'main', index: 0 }],
    ],
  },
  'AI Research': { main: [[{ node: 'Format Research', type: 'main', index: 0 }]] },
  'Format Research': { main: [[{ node: 'AI Writer', type: 'main', index: 0 }]] },
  'AI Writer': {
    main: [[{ node: 'Select Best Draft', type: 'main', index: 0 }]],
    ai_outputParser: [[{ node: 'Structured Output Parser', type: 'ai_outputParser', index: 0 }]],
  },
  'Select Best Draft': { main: [[{ node: 'Parse Post JSON', type: 'main', index: 0 }]] },
  'Parse Post JSON': { main: [[{ node: 'Prep or Publish', type: 'main', index: 0 }]] },
  'Prep or Publish': {
    main: [
      [{ node: 'Save Pipeline Draft', type: 'main', index: 0 }],
      [{ node: 'Needs Image?', type: 'main', index: 0 }],
    ],
  },
  'Save Pipeline Draft': { main: [[{ node: 'Store Draft in Table', type: 'main', index: 0 }]] },
  'Store Draft in Table': { main: [[{ node: 'Log Run Outcome', type: 'main', index: 0 }]] },
  'Needs Image?': {
    main: [
      [{ node: 'AI Image Prompt Agent', type: 'main', index: 0 }],
      [{ node: 'Postiz - Get Channels', type: 'main', index: 0 }],
    ],
  },
  'AI Image Prompt Agent': { main: [[{ node: 'Generate an image', type: 'main', index: 0 }]] },
  'Generate an image': { main: [[{ node: 'Postiz', type: 'main', index: 0 }]] },
  Postiz: {
    main: [
      [{ node: 'Postiz - Get Channels', type: 'main', index: 0 }],
      [{ node: 'Mark Upload Failed', type: 'main', index: 0 }],
    ],
  },
  'Mark Upload Failed': { main: [[{ node: 'Prep Error Alert', type: 'main', index: 0 }]] },
  'Prep Error Alert': { main: [[{ node: 'Notify Error', type: 'main', index: 0 }, { node: 'Postiz - Get Channels', type: 'main', index: 0 }]] },
  'Postiz - Get Channels': { main: [[{ node: 'Build All Channel Posts', type: 'main', index: 0 }]] },
  'Build All Channel Posts': { main: [[{ node: 'Postiz - Post All Channels', type: 'main', index: 0 }]] },
  'Postiz - Post All Channels': {
    main: [
      [{ node: 'Log Run Outcome', type: 'main', index: 0 }],
      [{ node: 'Prep Error Alert', type: 'main', index: 0 }],
    ],
  },
  'Log Run Outcome': { main: [[{ node: 'Store Run Log', type: 'main', index: 0 }]] },
  'Store Run Log': { main: [[{ node: 'Release Mutex', type: 'main', index: 0 }]] },
};

wf.description = `Automated social media pipeline (America/New_York): 7AM prep, 8AM primary publish, Tue/Thu engage, Mon/Wed/Fri deep. Drafts in social_pipeline_drafts; runs logged in social_pipeline_runs. Review Postiz drafts before publishing.`;
wf.settings = { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true };

const out = {
  id: wf.id,
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: wf.settings,
  description: wf.description,
};

fs.writeFileSync(new URL('./social-workflow-updated.json', import.meta.url), JSON.stringify(out, null, 2));
console.log('Wrote workflow with', out.nodes.length, 'nodes');
