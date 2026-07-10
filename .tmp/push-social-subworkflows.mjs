import fs from 'fs';

const apiUrl = 'https://n8n.intrawebtech.com/api/v1';
const apiKey = process.env.N8N_API_KEY;
if (!apiKey) {
  console.error('N8N_API_KEY not set');
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(new URL('./social-parent-workflow.json', import.meta.url), 'utf8'));
const ids = {};

async function api(method, path, body) {
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': apiKey },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${text.slice(0, 1500)}`);
  return text ? JSON.parse(text) : null;
}

async function findWorkflowByName(name) {
  let cursor;
  do {
    const qs = cursor ? `?limit=100&cursor=${cursor}` : '?limit=100';
    const list = await api('GET', `/workflows${qs}`);
    const hit = list.data?.find((w) => w.name === name);
    if (hit) return hit;
    cursor = list.nextCursor;
  } while (cursor);
  return null;
}

async function publishWorkflow(id) {
  const wf = await api('GET', `/workflows/${id}`);
  return api('POST', `/workflows/${id}/activate`, { versionId: wf.versionId });
}

function cleanNode(n) {
  const out = {
    id: n.id,
    name: n.name,
    type: n.type,
    typeVersion: n.typeVersion,
    position: n.position,
    parameters: n.parameters,
  };
  if (n.credentials) out.credentials = n.credentials;
  if (n.retryOnFail) out.retryOnFail = n.retryOnFail;
  if (n.maxTries) out.maxTries = n.maxTries;
  if (n.waitBetweenTries) out.waitBetweenTries = n.waitBetweenTries;
  if (n.onError) out.onError = n.onError;
  return out;
}

for (const sw of bundle.subworkflows) {
  const existing = await findWorkflowByName(sw.name);
  const payload = {
    name: sw.name,
    nodes: sw.nodes.map(cleanNode),
    connections: sw.connections,
    settings: { executionOrder: 'v1' },
  };

  if (existing) {
    await api('PUT', `/workflows/${existing.id}`, payload);
    ids[sw.name] = existing.id;
    await publishWorkflow(existing.id);
    console.log('Updated sub-workflow', sw.name, existing.id);
  } else {
    const created = await api('POST', '/workflows', payload);
    ids[sw.name] = created.id;
    await publishWorkflow(created.id);
    console.log('Created sub-workflow', sw.name, created.id);
    if (bundle.projectId) {
      try {
        await api('PUT', `/workflows/${created.id}/transfer`, { destinationProjectId: bundle.projectId });
      } catch (e) {
        console.warn('Project transfer skipped:', e.message);
      }
    }
  }
}

const parent = bundle.parent;
for (const node of parent.nodes) {
  if (node.name === 'Run Collect Research') node.parameters.workflowId.value = ids['SYS-Social-CollectResearch'];
  if (node.name === 'Run Generate Media') node.parameters.workflowId.value = ids['SYS-Social-GenerateMedia'];
  if (node.name === 'Run Publish Postiz') node.parameters.workflowId.value = ids['SYS-Social-PublishPostiz'];
}

await api('PUT', `/workflows/${parent.id}`, {
  name: parent.name,
  nodes: parent.nodes.map(cleanNode),
  connections: parent.connections,
  settings: parent.settings,
});

await publishWorkflow(parent.id);

console.log('Updated parent workflow', parent.id, 'nodes:', parent.nodes.length);
console.log('Sub-workflow IDs:', JSON.stringify(ids, null, 2));
