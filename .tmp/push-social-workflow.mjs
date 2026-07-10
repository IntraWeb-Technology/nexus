import fs from 'fs';

const apiUrl = 'https://n8n.intrawebtech.com/api/v1';
const apiKey = process.env.N8N_API_KEY;
if (!apiKey) {
  console.error('N8N_API_KEY not set');
  process.exit(1);
}

const wf = JSON.parse(fs.readFileSync(new URL('./social-workflow-updated.json', import.meta.url), 'utf8'));

const body = {
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: { executionOrder: wf.settings.executionOrder },
  description: wf.description,
};

const res = await fetch(`${apiUrl}/workflows/${wf.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': apiKey,
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error('Failed', res.status, text.slice(0, 2000));
  process.exit(1);
}
console.log('Updated workflow', wf.id, 'nodes:', wf.nodes.length);
