import fs from 'fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const WORKFLOW_ID = 'gHdJOdGpVHf6POqo';
const EDITORIAL_HISTORY_TABLE_ID = 'C602GFJuqtYryiES';
const DRAFTS_TABLE_ID = 'g3axXQ2YWW4MFb9r';
const TZ = 'America/New_York';

const readCode = (name) =>
  fs.readFileSync(join(__dirname, 'content-workflow', name), 'utf8');

const readTmp = (name) => fs.readFileSync(join(__dirname, name), 'utf8');

const srcPath = process.argv[2] || join(__dirname, 'content-workflow', 'workflow-source.json');
if (!fs.existsSync(srcPath)) {
  throw new Error(`Workflow source not found: ${srcPath}. Run push-content-workflow.mjs`);
}

const wf = JSON.parse(fs.readFileSync(srcPath, 'utf8')).data || JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const KEEP = new Set([
  'Perplexity Research',
  'AI Writer',
  'Generate an image',
  'Postiz - Get Channels',
  'Postiz - Upload',
]);

wf.nodes = wf.nodes.filter((n) => KEEP.has(n.name));

function patchFormatResearch() {
  return readTmp('format-research.js')
    .replace(/Collect and Score Sources/g, 'Editorial Planner')
    .replace(/safeNode\('Topic'\)/g, "safeNode('Editorial Planner')")
    .replace('const topicData = safeNode(\'Editorial Planner\');', 'const topicData = collected;');
}

const writerSystemPrompt = `You are a senior software engineer writing thoughtful LinkedIn posts for a technical personal brand.

CONTENT TYPE: {{ $json.contentType || 'linkedin_post' }}
CATEGORY: {{ $json.categoryLabel || $json.category }}
FOCUS: {{ $json.categoryFocus }}

Quality rules (mandatory):
- Teach something useful with engineering insight
- Avoid clickbait and generic AI wording
- Include practical takeaways and encourage discussion
- Prefer thoughtful analysis over headline repetition
- Never publish shallow summaries

From the research briefing, write ONE high-quality post.
- 4-6 sentences with double line breaks
- End with a discussion question
- No hashtags, emojis, or em dashes
- No URLs in body (added automatically in first comment after publish)

Return ONLY valid JSON:
{
  "headline": "...",
  "message": "...",
  "short_message": "...",
  "story_index": 1,
  "score": 85
}`;

const researchPrompt = `={{ \`You are a professional technology researcher.

CATEGORY: \${$json.categoryLabel || $json.category}
TOPIC DIRECTION: \${$json.topic}
FOCUS: \${$json.categoryFocus}
CONTENT TYPE: \${$json.contentType || 'linkedin_post'}

\${$json.category === 'weekly_roundup' ? 'This is a WEEKLY ROUNDUP. Cover: biggest announcement, biggest release, biggest lesson, and what developers should watch next.' : ''}
\${$json.longForm ? 'This is a LONG-FORM deep dive. Prioritize educational depth and system-level insight.' : ''}

Find 6-8 recent stories from the past 48 hours (or past 7 days for weekly roundup).

Trending signals:
\${($json.topStories || []).slice(0, 8).map((s, i) => \`\${i + 1}. [\${s.source}] \${s.title} — \${s.link}\`).join('\\n') || 'No collector hints.'}

For EACH story:
---
### STORY N
Title: [headline]
Date: [ISO datetime]
Summary: [2-3 sentences]
Why it matters: [1-2 sentences with engineering insight]
Source URL: https://full-article-url
Extra URLs: none

CRITICAL: Source URL must be a full https:// article URL.\` }}`;

const X = (n) => 320 * n;

wf.nodes.push(
  {
    id: 'trig-daily',
    name: '8:30 AM Daily',
    type: 'n8n-nodes-base.scheduleTrigger',
    typeVersion: 1.3,
    position: [X(0), 300],
    parameters: {
      rule: { interval: [{ triggerAtHour: 8, triggerAtMinute: 30 }] },
      timezone: TZ,
    },
  },
  {
    id: 'sticky-note',
    name: 'Sticky Note',
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position: [X(0), 80],
    parameters: {
        content:
          '## Editorial Calendar (simplified)\n**8:30** Plan + research + write\n**Wait** until 10:00 AM ET\n**10:00** Image + Postiz **draft** (review before publish) + first comment\n\nMon Tech · Tue SWE · Wed AI · Thu Deep Dive · Fri Roundup · Sat Career · Sun Evergreen',
      height: 180,
      width: 420,
    },
  },
  {
    id: 'load-history',
    name: 'Load Editorial History',
    type: 'n8n-nodes-base.dataTable',
    typeVersion: 1.1,
    position: [X(1), 300],
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: EDITORIAL_HISTORY_TABLE_ID },
      returnAll: true,
      limit: 100,
    },
  },
  {
    id: 'load-drafts',
    name: 'Load Queued Drafts',
    type: 'n8n-nodes-base.dataTable',
    typeVersion: 1.1,
    position: [X(2), 300],
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: DRAFTS_TABLE_ID },
      returnAll: true,
      limit: 50,
    },
  },
  {
    id: 'editorial-planner',
    name: 'Editorial Planner',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [X(3), 300],
    parameters: { jsCode: readCode('editorial-planner.js') },
  },
  {
    id: 'skip-if',
    name: 'Skip?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [X(4), 300],
    parameters: {
      conditions: {
        combinator: 'and',
        conditions: [{
          id: 'skip-run',
          leftValue: '={{ $json.skipRun }}',
          operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' },
          rightValue: true,
        }],
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      },
    },
  },
  {
    id: 'format-research',
    name: 'Format Research',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [X(6), 300],
    parameters: { jsCode: patchFormatResearch() },
  },
  {
    id: 'prepare-post',
    name: 'Prepare Post',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [X(8), 300],
    parameters: { jsCode: readCode('prepare-post.js') },
  },
  {
    id: 'valid-if',
    name: 'Valid Post?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [X(9), 300],
    parameters: {
      conditions: {
        combinator: 'and',
        conditions: [{
          id: 'valid-post',
          leftValue: '={{ $json.validPost }}',
          operator: { name: 'filter.operator.equals', operation: 'equals', type: 'boolean' },
          rightValue: true,
        }],
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      },
    },
  },
  {
    id: 'wait-10am',
    name: 'Wait Until 10 AM',
    type: 'n8n-nodes-base.wait',
    typeVersion: 1.1,
    position: [X(10), 300],
    parameters: {
      resume: 'specificTime',
      dateTime: "={{ $now.setZone('America/New_York').startOf('day').plus({ hours: 10 }).toISO() }}",
    },
  },
  {
    id: 'ai-image-prompt-agent',
    name: 'AI Image Prompt Agent',
    type: '@n8n/n8n-nodes-langchain.anthropic',
    typeVersion: 1,
    position: [X(11), 300],
    parameters: {
      modelId: {
        __rl: true,
        value: 'claude-sonnet-5',
        mode: 'list',
        cachedResultName: 'claude-sonnet-5',
      },
      messages: {
        values: [{
          content:
            "=You are an expert visual prompt engineer for LinkedIn social posts.\n\nWrite ONE detailed image-generation prompt based on the post below. The image must be professional, modern, and visually compelling. Do not include any text, logos, watermarks, or UI chrome in the image.\n\nHeadline: {{ $('Prepare Post').item.json.headline }}\n\nPost:\n{{ $('Prepare Post').item.json.message }}\n\nReturn ONLY the image prompt text. No JSON, no markdown, no explanation.",
        }],
      },
      options: {},
    },
    credentials: {
      anthropicApi: {
        id: 'HprVnCwfCT3ULYEp',
        name: 'Anthropic account',
      },
    },
  },
  {
    id: 'build-postiz-payload',
    name: 'Build Postiz Payload',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [X(15), 480],
    parameters: { jsCode: readCode('build-postiz-payload.js') },
  },
  {
    id: 'postiz-post-all-channels',
    name: 'Postiz - Post All Channels',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [X(16), 480],
    parameters: {
      method: 'POST',
      url: 'https://postiz-t8bc.srv1343086.hstgr.cloud/api/public/v1/posts',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ type: $json.type, shortLink: $json.shortLink, date: $json.date, tags: $json.tags, posts: $json.posts }) }}',
      options: {},
    },
    credentials: {
      httpHeaderAuth: {
        id: 'pKZXgJlIMZJY3me8',
        name: 'Postiz API Authorization',
      },
    },
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000,
    onError: 'continueErrorOutput',
  },
  {
    id: 'finalize',
    name: 'Finalize Publish',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [X(17), 300],
    parameters: { jsCode: readCode('finalize-publish.js') },
  },
  {
    id: 'store-history',
    name: 'Store Editorial History',
    type: 'n8n-nodes-base.dataTable',
    typeVersion: 1.1,
    position: [X(18), 300],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: EDITORIAL_HISTORY_TABLE_ID },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          date: '={{ $json.date }}',
          category: '={{ $json.category }}',
          topic: '={{ $json.topic }}',
          headline: '={{ $json.headline }}',
          url: '={{ $json.url }}',
          published: '={{ $json.published }}',
        },
      },
    },
  },
);

// Update retained nodes
const perplexity = wf.nodes.find((n) => n.name === 'Perplexity Research');
Object.assign(perplexity, {
  position: [X(5), 300],
  parameters: {
    messages: { message: [{ content: researchPrompt }] },
    simplify: true,
    options: { searchRecency: 'day' },
    requestOptions: {},
  },
});

const writer = wf.nodes.find((n) => n.name === 'AI Writer');
Object.assign(writer, {
  position: [X(7), 300],
  parameters: {
    modelId: { __rl: true, cachedResultName: 'claude-sonnet-5', mode: 'list', value: 'claude-sonnet-5' },
    messages: {
      values: [
        { content: writerSystemPrompt },
        {
          content:
            "=Research briefing:\n\n{{ $json.researchText || $json.storyCatalog || $('Perplexity Research').item.json.message || 'No research available.' }}\n\nCategory: {{ $('Editorial Planner').item.json.categoryLabel }}\nTopic: {{ $('Editorial Planner').item.json.topic }}",
        },
      ],
    },
    options: { maxTokens: 2048 },
  },
});

const positions = {
  'AI Image Prompt Agent': [X(11), 300],
  'Generate an image': [X(12), 480],
  'Postiz - Upload': [X(13), 480],
  'Postiz - Get Channels': [X(14), 480],
};
for (const [name, pos] of Object.entries(positions)) {
  const n = wf.nodes.find((x) => x.name === name);
  if (n) n.position = pos;
}

const genImage = wf.nodes.find((n) => n.name === 'Generate an image');
if (genImage) {
  genImage.parameters.prompt =
    "={{ ($json.content || []).find((c) => c.type === 'text')?.text || $json.content?.[0]?.text || '' }}";
}

const postizUpload = wf.nodes.find((n) => n.name === 'Postiz - Upload');
if (postizUpload) {
  postizUpload.retryOnFail = true;
  postizUpload.maxTries = 3;
  postizUpload.waitBetweenTries = 5000;
  postizUpload.onError = 'continueErrorOutput';
}

wf.connections = {
  '8:30 AM Daily': { main: [[{ node: 'Load Editorial History', type: 'main', index: 0 }]] },
  'Load Editorial History': { main: [[{ node: 'Load Queued Drafts', type: 'main', index: 0 }]] },
  'Load Queued Drafts': { main: [[{ node: 'Editorial Planner', type: 'main', index: 0 }]] },
  'Editorial Planner': { main: [[{ node: 'Skip?', type: 'main', index: 0 }]] },
  'Skip?': {
    main: [
      [],
      [{ node: 'Perplexity Research', type: 'main', index: 0 }],
    ],
  },
  'Perplexity Research': { main: [[{ node: 'Format Research', type: 'main', index: 0 }]] },
  'Format Research': { main: [[{ node: 'AI Writer', type: 'main', index: 0 }]] },
  'AI Writer': { main: [[{ node: 'Prepare Post', type: 'main', index: 0 }]] },
  'Prepare Post': { main: [[{ node: 'Valid Post?', type: 'main', index: 0 }]] },
  'Valid Post?': {
    main: [
      [{ node: 'Wait Until 10 AM', type: 'main', index: 0 }],
      [],
    ],
  },
  'Wait Until 10 AM': { main: [[{ node: 'AI Image Prompt Agent', type: 'main', index: 0 }]] },
  'AI Image Prompt Agent': { main: [[{ node: 'Generate an image', type: 'main', index: 0 }]] },
  'Generate an image': { main: [[{ node: 'Postiz - Upload', type: 'main', index: 0 }]] },
  'Postiz - Upload': { main: [[{ node: 'Postiz - Get Channels', type: 'main', index: 0 }]] },
  'Postiz - Get Channels': { main: [[{ node: 'Build Postiz Payload', type: 'main', index: 0 }]] },
  'Build Postiz Payload': { main: [[{ node: 'Postiz - Post All Channels', type: 'main', index: 0 }]] },
  'Postiz - Post All Channels': { main: [[{ node: 'Finalize Publish', type: 'main', index: 0 }]] },
  'Finalize Publish': { main: [[{ node: 'Store Editorial History', type: 'main', index: 0 }]] },
};

wf.name = 'Content Pipeline — Editorial Calendar';
wf.description =
  'Daily pipeline (America/New_York): 8:30 plan/research/write, wait until 10:00, create Postiz drafts on all channels (review before publish) with delayed first comment.';
wf.settings = { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true };

const out = {
  id: WORKFLOW_ID,
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: wf.settings,
  description: wf.description,
};

fs.writeFileSync(join(__dirname, 'content-workflow-updated.json'), JSON.stringify(out, null, 2));
console.log('Wrote simplified workflow with', out.nodes.length, 'nodes');
