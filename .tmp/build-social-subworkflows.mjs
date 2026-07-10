import fs from 'fs';

const PROJECT_ID = 'o5dYIcHW2mxs82d6';
const PARENT_ID = 'uRUY8ZSdzpVeTkr3';
const CHAT_ALERT_WF = 'PGf6jPoWtxSPlr0h';
const RUNS_TABLE_ID = 'xFUUGHuJD0YMJeiD';
const DRAFTS_TABLE_ID = 'g3axXQ2YWW4MFb9r';

const src = JSON.parse(
  fs.readFileSync(
    'C:/Users/jschi/.cursor/projects/e-IntraWeb-Technologies-10-Repos-nexus/agent-tools/e8bcaa8a-1194-4e10-bcaa-a36655de57d7.txt',
    'utf8',
  ),
).data;

function pick(name) {
  const n = src.nodes.find((x) => x.name === name);
  if (!n) throw new Error(`Missing node: ${name}`);
  return JSON.parse(JSON.stringify(n));
}

function cloneNode(node, dx = 0, dy = 0) {
  const n = JSON.parse(JSON.stringify(node));
  n.position = [n.position[0] + dx, n.position[1] + dy];
  return n;
}

const trigger = {
  id: 'sw-trigger',
  name: 'Execute Workflow Trigger',
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  typeVersion: 1.1,
  position: [240, 300],
  parameters: { inputSource: 'passthrough' },
};

const skipCollectorIf = {
  id: 'skip-collector-if',
  name: 'Skip Collector?',
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [460, 300],
  parameters: {
    conditions: {
      combinator: 'or',
      conditions: [
        {
          id: 'skip-collector-flag',
          leftValue: '={{ $json.skipCollector }}',
          operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' },
          rightValue: true,
        },
        {
          id: 'skip-research-with-topic',
          leftValue: '={{ $json.skipResearch === true && !!$json.topic }}',
          operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' },
          rightValue: true,
        },
      ],
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
    },
    options: {},
  },
};

// --- CollectResearch ---
const collectResearchNodes = [
  trigger,
  skipCollectorIf,
  cloneNode(pick('Collect and Score Sources'), 0, 0),
  cloneNode(pick('Topic'), 0, 0),
  cloneNode(pick('Skip Research?'), 0, 0),
  cloneNode(pick('AI Research'), 0, 0),
  cloneNode(pick('Format Research'), 0, 0),
  cloneNode(pick('AI Writer'), 0, 0),
  cloneNode(pick('Structured Output Parser'), 0, 0),
  cloneNode(pick('Select Best Draft'), 0, 0),
  cloneNode(pick('Parse Post JSON'), 0, 0),
];

const collectResearchConnections = {
  'Execute Workflow Trigger': { main: [[{ node: 'Skip Collector?', type: 'main', index: 0 }]] },
  'Skip Collector?': {
    main: [
      [{ node: 'Topic', type: 'main', index: 0 }],
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
};

const passThroughPost = {
  id: 'pass-through-post',
  name: 'Pass Through Post',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [2920, 480],
  parameters: {
    jsCode: "const post = $('Execute Workflow Trigger').first()?.json || $input.first()?.json || {};\nreturn [{ json: { ...post, mediaUploadFailed: false } }];",
  },
};

const mergeMediaOutput = {
  id: 'merge-media-output',
  name: 'Merge Media Output',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [3920, 336],
    parameters: {
      jsCode: `function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const post = $('Execute Workflow Trigger').first()?.json || {};
const failed = safeNode('Mark Upload Failed');
if (failed) return [{ json: failed }];
const upload = safeNode('Postiz') || {};
if (upload?.id && upload?.path) return [{ json: { ...post, ...upload, mediaUploadFailed: false } }];
const passthrough = safeNode('Pass Through Post');
if (passthrough) return [{ json: passthrough }];
return [{ json: { ...post, mediaUploadFailed: false } }];`,
    },
};

const markUploadFailedSw = cloneNode(pick('Mark Upload Failed'));
markUploadFailedSw.parameters.jsCode = `const post = $('Execute Workflow Trigger').first()?.json || $input.first()?.json || {};
const err = $input.first()?.json?.error || {};
return [{ json: {
  ...post,
  mediaUploadFailed: true,
  uploadError: err.message || err.description || 'Postiz upload failed',
} }];`;

// --- GenerateMedia ---
const generateMediaNodes = [
  { ...trigger, id: 'sw-media-trigger', position: [240, 360] },
  cloneNode(pick('Needs Image?'), 0, 60),
  cloneNode(pick('AI Image Prompt Agent'), 0, 60),
  cloneNode(pick('Generate an image'), 0, 60),
  cloneNode(pick('Postiz'), 0, 60),
  markUploadFailedSw,
  passThroughPost,
  mergeMediaOutput,
];

const generateMediaConnections = {
  'Execute Workflow Trigger': { main: [[{ node: 'Needs Image?', type: 'main', index: 0 }]] },
  'Needs Image?': {
    main: [
      [{ node: 'AI Image Prompt Agent', type: 'main', index: 0 }],
      [{ node: 'Pass Through Post', type: 'main', index: 0 }],
    ],
  },
  'AI Image Prompt Agent': { main: [[{ node: 'Generate an image', type: 'main', index: 0 }]] },
  'Generate an image': { main: [[{ node: 'Postiz', type: 'main', index: 0 }]] },
  Postiz: {
    main: [
      [{ node: 'Merge Media Output', type: 'main', index: 0 }],
      [{ node: 'Mark Upload Failed', type: 'main', index: 0 }],
    ],
  },
  'Mark Upload Failed': { main: [[{ node: 'Merge Media Output', type: 'main', index: 0 }]] },
  'Pass Through Post': { main: [[{ node: 'Merge Media Output', type: 'main', index: 0 }]] },
};

const buildAllSw = cloneNode(pick('Build All Channel Posts'));
buildAllSw.parameters.jsCode = fs.readFileSync(new URL('./build-all-channel-posts-sw.js', import.meta.url), 'utf8');

const publishResult = {
  id: 'publish-result',
  name: 'Publish Result',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [4368, 360],
  parameters: {
    jsCode: `const post = $('Execute Workflow Trigger').first()?.json || {};
const build = $('Build All Channel Posts').first()?.json || {};
const http = $input.first()?.json || {};
return [{ json: {
  ...post,
  postizPayload: build,
  postizResponse: http,
  postiz_id: http.id || http.data?.id || '',
  status: http.error ? 'error' : 'success',
} }];`,
  },
};

// --- PublishPostiz ---
const publishPostizNodes = [
  { ...trigger, id: 'sw-publish-trigger', position: [240, 360] },
  cloneNode(pick('Postiz - Get Channels'), 0, 60),
  buildAllSw,
  cloneNode(pick('Postiz - Post All Channels'), 0, 60),
  publishResult,
];

const publishPostizConnections = {
  'Execute Workflow Trigger': { main: [[{ node: 'Postiz - Get Channels', type: 'main', index: 0 }]] },
  'Postiz - Get Channels': { main: [[{ node: 'Build All Channel Posts', type: 'main', index: 0 }]] },
  'Build All Channel Posts': { main: [[{ node: 'Postiz - Post All Channels', type: 'main', index: 0 }]] },
  'Postiz - Post All Channels': { main: [[{ node: 'Publish Result', type: 'main', index: 0 }]] },
};

const subworkflows = [
  {
    name: 'SYS-Social-CollectResearch',
    description: 'Collect trending sources, research with Perplexity, write with Claude, select best draft, parse post JSON.',
    nodes: collectResearchNodes,
    connections: collectResearchConnections,
  },
  {
    name: 'SYS-Social-GenerateMedia',
    description: 'Generate Gemini image (unless engage post), upload to Postiz with retry; text-only fallback on upload failure.',
    nodes: generateMediaNodes,
    connections: generateMediaConnections,
  },
  {
    name: 'SYS-Social-PublishPostiz',
    description: 'Fetch Postiz channels, build platform-aware posts, create draft or publish now.',
    nodes: publishPostizNodes,
    connections: publishPostizConnections,
  },
];

fs.writeFileSync(new URL('./social-subworkflows.json', import.meta.url), JSON.stringify(subworkflows, null, 2));

// --- Parent workflow (orchestrator) ---
const keepNames = new Set([
  '7AM Prep', '8AM Primary', '12PM Engage', '530PM Deep',
  'Init Prep Slot', 'Init Primary Slot', 'Init Engage Slot', 'Init Deep Slot',
  'Acquire Mutex', 'Mutex Blocked?', 'Route Slot', 'Log Skipped Run',
  "Get Today's Draft", 'Load Primary Draft', 'Has Saved Draft?', 'Validate Draft', 'Draft Still Valid?',
  'Prep or Publish', 'Save Pipeline Draft', 'Store Draft in Table',
  'Log Run Outcome', 'Store Run Log', 'Release Mutex',
  'Prep Error Alert', 'Notify Error',
]);

const removeFromParent = new Set([
  'Collect and Score Sources', 'Topic', 'Skip Research?', 'AI Research', 'Format Research',
  'AI Writer', 'Structured Output Parser', 'Select Best Draft', 'Parse Post JSON',
  'Needs Image?', 'AI Image Prompt Agent', 'Generate an image', 'Postiz', 'Mark Upload Failed',
  'Postiz - Get Channels', 'Build All Channel Posts', 'Postiz - Post All Channels',
]);

const parentNodes = src.nodes.filter((n) => keepNames.has(n.name));

const execCollect = {
  id: 'exec-collect-research',
  name: 'Run Collect Research',
  type: 'n8n-nodes-base.executeWorkflow',
  typeVersion: 1.3,
  position: [960, 208],
  parameters: { source: 'database', workflowId: { __rl: true, mode: 'id', value: '__COLLECT__' } },
};

const execMedia = {
  id: 'exec-generate-media',
  name: 'Run Generate Media',
  type: 'n8n-nodes-base.executeWorkflow',
  typeVersion: 1.3,
  position: [2800, 336],
  parameters: { source: 'database', workflowId: { __rl: true, mode: 'id', value: '__MEDIA__' } },
  onError: 'continueErrorOutput',
};

const execPublish = {
  id: 'exec-publish-postiz',
  name: 'Run Publish Postiz',
  type: 'n8n-nodes-base.executeWorkflow',
  typeVersion: 1.3,
  position: [4200, 336],
  parameters: { source: 'database', workflowId: { __rl: true, mode: 'id', value: '__PUBLISH__' } },
  onError: 'continueErrorOutput',
};

const notifyUploadFailed = {
  id: 'notify-upload-failed',
  name: 'Notify Upload Failed',
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [3020, 336],
  parameters: {
    conditions: {
      combinator: 'and',
      conditions: [{
        id: 'upload-failed-check',
        leftValue: '={{ $json.mediaUploadFailed }}',
        operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' },
        rightValue: true,
      }],
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
    },
    options: {},
  },
};

const prepUploadAlert = cloneNode(pick('Prep Error Alert'));
prepUploadAlert.id = 'prep-upload-alert';
prepUploadAlert.name = 'Prep Upload Alert';
prepUploadAlert.position = [3240, 480];
prepUploadAlert.parameters.jsCode = `const post = $('Run Generate Media').first()?.json || $input.first()?.json || {};
const slot = $('Acquire Mutex').first()?.json || {};
return [{ json: {
  priority: 'error',
  message: \`Social pipeline media upload failed (\${slot.postType || post.postType || 'unknown'} / \${slot.pipelineSlot || 'publish'}): \${post.headline || post.topic || 'no headline'} — \${post.uploadError || 'Postiz upload failed'}. Continuing text-only.\`,
} }];`;

const prepErrorAlert = parentNodes.find((n) => n.name === 'Prep Error Alert');
if (prepErrorAlert) {
  prepErrorAlert.parameters.jsCode = `const post = $('Run Publish Postiz').first()?.json || $('Run Generate Media').first()?.json || $('Run Collect Research').first()?.json || {};
const slot = $('Acquire Mutex').first()?.json || {};
const err = $input.first()?.json?.error || $input.first()?.json || {};
const msg = err.message || err.description || post.uploadError || JSON.stringify(err).slice(0, 500);
return [{ json: {
  priority: 'error',
  message: \`Social pipeline failed (\${slot.postType || post.postType || 'unknown'} / \${slot.pipelineSlot || 'publish'}): \${post.headline || post.topic || 'no headline'} — \${msg}\`,
} }];`;
}

const notifyError = parentNodes.find((n) => n.name === 'Notify Error');
if (notifyError) {
  notifyError.parameters = { source: 'database', workflowId: { __rl: true, mode: 'id', value: CHAT_ALERT_WF } };
}

parentNodes.push(execCollect, execMedia, notifyUploadFailed, prepUploadAlert, execPublish);

// Fix data table ids
for (const name of ["Get Today's Draft", 'Store Draft in Table', 'Store Run Log']) {
  const n = parentNodes.find((x) => x.name === name);
  n.parameters.dataTableId = { __rl: true, mode: 'id', value: name === 'Store Run Log' ? RUNS_TABLE_ID : DRAFTS_TABLE_ID };
}

// Init engage/deep: set skipCollector
for (const name of ['Init Engage Slot', 'Init Deep Slot']) {
  const n = parentNodes.find((x) => x.name === name);
  const code = n.parameters.jsCode;
  if (!code.includes('skipCollector')) {
    n.parameters.jsCode = code.replace(
      /return \[\{ json: \{/,
      'return [{ json: { skipCollector: true,',
    );
  }
}

const parentConnections = {
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
      [{ node: 'Run Collect Research', type: 'main', index: 0 }],
      [{ node: 'Run Collect Research', type: 'main', index: 0 }],
      [{ node: "Get Today's Draft", type: 'main', index: 0 }],
    ],
  },
  "Get Today's Draft": { main: [[{ node: 'Load Primary Draft', type: 'main', index: 0 }]] },
  'Load Primary Draft': { main: [[{ node: 'Has Saved Draft?', type: 'main', index: 0 }]] },
  'Has Saved Draft?': {
    main: [
      [{ node: 'Validate Draft', type: 'main', index: 0 }],
      [{ node: 'Run Collect Research', type: 'main', index: 0 }],
    ],
  },
  'Validate Draft': { main: [[{ node: 'Draft Still Valid?', type: 'main', index: 0 }]] },
  'Draft Still Valid?': {
    main: [
      [{ node: 'Run Generate Media', type: 'main', index: 0 }],
      [{ node: 'Run Collect Research', type: 'main', index: 0 }],
    ],
  },
  'Run Collect Research': { main: [[{ node: 'Prep or Publish', type: 'main', index: 0 }]] },
  'Prep or Publish': {
    main: [
      [{ node: 'Save Pipeline Draft', type: 'main', index: 0 }],
      [{ node: 'Run Generate Media', type: 'main', index: 0 }],
    ],
  },
  'Save Pipeline Draft': { main: [[{ node: 'Store Draft in Table', type: 'main', index: 0 }]] },
  'Store Draft in Table': { main: [[{ node: 'Log Run Outcome', type: 'main', index: 0 }]] },
  'Run Generate Media': {
    main: [
      [{ node: 'Notify Upload Failed', type: 'main', index: 0 }],
      [{ node: 'Prep Upload Alert', type: 'main', index: 0 }, { node: 'Run Publish Postiz', type: 'main', index: 0 }],
    ],
  },
  'Notify Upload Failed': {
    main: [
      [{ node: 'Prep Upload Alert', type: 'main', index: 0 }, { node: 'Run Publish Postiz', type: 'main', index: 0 }],
      [{ node: 'Run Publish Postiz', type: 'main', index: 0 }],
    ],
  },
  'Prep Upload Alert': { main: [[{ node: 'Notify Error', type: 'main', index: 0 }]] },
  'Run Publish Postiz': {
    main: [
      [{ node: 'Log Run Outcome', type: 'main', index: 0 }],
      [{ node: 'Prep Error Alert', type: 'main', index: 0 }],
    ],
  },
  'Prep Error Alert': { main: [[{ node: 'Notify Error', type: 'main', index: 0 }, { node: 'Log Run Outcome', type: 'main', index: 0 }]] },
  'Log Run Outcome': { main: [[{ node: 'Store Run Log', type: 'main', index: 0 }]] },
  'Store Run Log': { main: [[{ node: 'Release Mutex', type: 'main', index: 0 }]] },
};

const parent = {
  id: PARENT_ID,
  name: src.name,
  description: src.description,
  nodes: parentNodes,
  connections: parentConnections,
  settings: { executionOrder: 'v1' },
};

fs.writeFileSync(new URL('./social-parent-workflow.json', import.meta.url), JSON.stringify({ subworkflows, parent, projectId: PROJECT_ID }, null, 2));
console.log('Built', subworkflows.length, 'sub-workflows and parent with', parentNodes.length, 'nodes');
