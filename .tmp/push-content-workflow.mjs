import fs from 'fs';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function loadKeyFromMcp() {
  const p = join(homedir(), '.cursor', 'mcp.json');
  if (!existsSync(p)) return '';
  const j = JSON.parse(readFileSync(p, 'utf8'));
  for (const v of Object.values(j.mcpServers || {})) {
    const key = v?.env?.N8N_API_KEY;
    if (typeof key === 'string' && key.trim()) return key.trim();
  }
  return '';
}

const apiUrl = 'https://n8n.intrawebtech.com/api/v1';
const apiKey = (process.env.N8N_API_KEY || loadKeyFromMcp()).trim();
if (!apiKey) {
  console.error('Missing N8N_API_KEY');
  process.exit(1);
}

const wfId = 'gHdJOdGpVHf6POqo';
const srcPath = join(__dirname, 'content-workflow', 'workflow-source.json');

const res = await fetch(`${apiUrl}/workflows/${wfId}`, {
  headers: { 'X-N8N-API-KEY': apiKey },
});
const text = await res.text();
if (!res.ok) {
  console.error('Fetch failed', res.status, text.slice(0, 1000));
  process.exit(1);
}
fs.writeFileSync(srcPath, text);
console.log('Saved workflow source');

const build = spawnSync(process.execPath, [join(__dirname, 'build-content-workflow.mjs')], {
  stdio: 'inherit',
  cwd: __dirname,
});
if (build.status !== 0) process.exit(build.status || 1);

const updated = JSON.parse(fs.readFileSync(join(__dirname, 'content-workflow-updated.json'), 'utf8'));

const body = {
  name: updated.name,
  nodes: updated.nodes,
  connections: updated.connections,
  settings: { executionOrder: updated.settings.executionOrder },
  description: updated.description,
};

const put = await fetch(`${apiUrl}/workflows/${wfId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': apiKey,
  },
  body: JSON.stringify(body),
});
const putText = await put.text();
if (!put.ok) {
  console.error('Push failed', put.status, putText.slice(0, 3000));
  process.exit(1);
}

console.log('Pushed workflow', wfId, 'nodes:', updated.nodes.length);
