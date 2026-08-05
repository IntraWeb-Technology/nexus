/**
 * Set availableInMCP: true on every workflow JSON under packages/n8n-workflows.
 * Optionally ensures callerPolicy defaults to workflowsFromSameOwner when absent.
 *
 * Usage: node packages/n8n-workflows/scripts/enable-mcp-all-workflows.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function walkJsonFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue;
      walkJsonFiles(p, out);
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      out.push(p);
    }
  }
  return out;
}

function ensureMcpSettings(settings) {
  if (!settings || typeof settings !== 'object') return { changed: true, next: {} };
  const next = { ...settings };
  let changed = false;
  if (next.availableInMCP !== true) {
    next.availableInMCP = true;
    changed = true;
  }
  if (next.callerPolicy === undefined || next.callerPolicy === null || next.callerPolicy === '') {
    next.callerPolicy = 'workflowsFromSameOwner';
    changed = true;
  }
  return { changed, next };
}

let files = 0;
let updated = 0;
for (const file of walkJsonFiles(ROOT)) {
  const base = path.basename(file);
  if (base === 'package.json' || base === '_manifest.json') continue;
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  if (!Array.isArray(data.nodes)) continue;
  files += 1;

  let dirty = false;
  const root = ensureMcpSettings(data.settings);
  if (root.changed) {
    data.settings = root.next;
    dirty = true;
  }

  if (data.activeVersion && typeof data.activeVersion === 'object') {
    const av = ensureMcpSettings(data.activeVersion.settings);
    if (av.changed) {
      data.activeVersion.settings = av.next;
      dirty = true;
    }
  }

  if (dirty) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    updated += 1;
  }
}

console.log(JSON.stringify({ workflowJsonFiles: files, filesUpdated: updated }, null, 2));
