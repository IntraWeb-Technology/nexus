/**
 * Strip GitHub from workflow Lj9OHbsMMK6m5c6i; keep Google Drive + Chat + data table.
 * Run from repo root:
 *   node packages/n8n-workflows/scripts/patch-backup-workflow-google-drive-only.mjs
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnvLocal, baseUrl, fetchJson } from './lib/n8n-env.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PKG_ROOT = join(__dirname, '..')
const WORKFLOW_ID = 'Lj9OHbsMMK6m5c6i'
const OUT_FILE = join(
  PKG_ROOT,
  '09_documentation',
  'Automated workflow backup — Google Drive only __ Lj9OHbsMMK6m5c6i.json',
)

const REMOVE_NODE_IDS = new Set([
  'e55f2f41-5b2d-4073-a12c-cda68babf479',
  'ac9ea4ea-c73a-481e-a563-a864c5b84d46',
  '3963317d-6c8d-4b2f-be99-e4de36a4f883',
  '03794249-594d-4e46-be22-7b624ec859bd',
  '6d01636b-71e4-4982-b998-3cbeb6fec6c9',
])

const CONFIG_JS = `const cfg = $input.first().json || {};
const wb = cfg.workflowBackup || {};
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const backup_timestamp =
  now.getFullYear() +
  '-' +
  pad(now.getMonth() + 1) +
  '-' +
  pad(now.getDate()) +
  '_' +
  pad(now.getHours()) +
  '-' +
  pad(now.getMinutes()) +
  '-' +
  pad(now.getSeconds());
const m = wb.minutesPerWorkflowManual;
const minutes_per_workflow_manual = typeof m === 'number' && !Number.isNaN(m) ? m : 5;
const backup_folder_name = 'wfBackup - ' + backup_timestamp;

return [{
  json: {
    gdrive_folder_id: wb.gdriveParentFolderId || '1Re6nTdYldLFZdWk346KqN-cFCJkynEG1',
    gdrive_shared_drive_id: wb.gdriveSharedDriveId || '0AFmBrzlxIst5Uk9PVA',
    gdrive_shared_drive_cached_name: wb.gdriveSharedDriveName || 'Internal-Ops',
    backup_timestamp,
    backup_folder_name,
    minutes_per_workflow_manual,
    execution_start_time: now.toISOString(),
    execution_start_timestamp: now.getTime()
  }
}];`

function transformPrepareJs(js) {
  let out = js
  out = out.replace(
    /const githubPath = config\.repo_path \+ year \+ '\/' \+ month \+ '\/' \+ fileBase \+ '\.json';/,
    "const driveRelativePath = year + '/' + month + '/' + fileBase + '.json';",
  )
  out = out.replace(/github_path:\s*githubPath/, 'drive_relative_path: driveRelativePath')
  out = out.replace(/^const config = \$\('Config'\)\.first\(\)\.json;\n\n/m, '')
  return out
}

function pickSettings(obj) {
  if (!obj || typeof obj !== 'object') return {}
  const keys = [
    'executionOrder',
    'errorWorkflow',
    'timezone',
    'saveExecutionProgress',
    'saveManualExecutions',
    'saveDataErrorExecution',
    'saveDataSuccessExecution',
    'executionTimeout',
    'availableInMCP',
    'callerPolicy',
  ]
  const out = {}
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k]
  }
  return out
}

function patchWorkflow(wf) {
  const nodes = wf.nodes
    .filter((n) => !REMOVE_NODE_IDS.has(n.id))
    .map((n) => {
      if (n.name === 'Convert to JSON File') {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            mode: 'each',
            binaryPropertyName: 'data',
          },
        }
      }
      if (n.name === 'Config' && n.type === 'n8n-nodes-base.code') {
        return { ...n, parameters: { ...n.parameters, jsCode: CONFIG_JS } }
      }
      if (n.id === '0fd6de64-848e-419d-aa3f-b2f2b5aed464') {
        return {
          ...n,
          name: 'Prepare Backup Data',
          parameters: {
            ...n.parameters,
            jsCode: transformPrepareJs(n.parameters.jsCode || ''),
          },
        }
      }
      if (n.name === 'Upload to Google Drive') {
        return {
          ...n,
          parameters: {
            authentication: 'oAuth2',
            resource: 'file',
            operation: 'upload',
            inputDataFieldName: 'data',
            name: "={{ $('Prepare Backup Data').item.json.backup_file_base }}.json",
            driveId: {
              __rl: true,
              mode: 'id',
              value: "={{ $('Config').first().json.gdrive_shared_drive_id }}",
            },
            folderId: {
              __rl: true,
              mode: 'id',
              value: "={{ $('Create GDrive Folder').first().json.id }}",
            },
            options: n.parameters.options || {},
          },
        }
      }
      if (n.name === 'Create GDrive Folder') {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            resource: 'folder',
            name: '={{ $json.backup_folder_name }}',
            driveId: {
              __rl: true,
              value: '={{ $json.gdrive_shared_drive_id }}',
              mode: 'list',
              cachedResultName: '={{ $json.gdrive_shared_drive_cached_name }}',
              cachedResultUrl:
                "={{ 'https://drive.google.com/drive/folders/' + $json.gdrive_shared_drive_id }}",
            },
            folderId: {
              __rl: true,
              mode: 'id',
              value: '={{ $json.gdrive_folder_id }}',
            },
          },
        }
      }
      if (n.id === '5ad80cb7-5421-4ea0-9bf1-ac26bb1b2dc2' && n.name === 'Edit Fields1') {
        const assignments = n.parameters.assignments.assignments.map((a) => {
          if (a.name === 'github_path') {
            return {
              ...a,
              value: "={{ $('Prepare Backup Data').item.json.drive_relative_path }}",
            }
          }
          return a
        })
        return {
          ...n,
          parameters: {
            ...n.parameters,
            assignments: { ...n.parameters.assignments, assignments },
          },
        }
      }
      if (n.id === '2df0bf8f-077b-4c35-acba-77b6cb7eca44' && n.name === 'Mark Complete') {
        const assignments = n.parameters.assignments.assignments.filter((a) => a.name !== 'github_backup')
        return {
          ...n,
          parameters: {
            ...n.parameters,
            assignments: { ...n.parameters.assignments, assignments },
          },
        }
      }
      if (n.type === 'n8n-nodes-base.stickyNote' && n.name === 'Sticky Note') {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            content:
              '## n8n Workflow Backup (IntraWeb OS)\n\n**Credentials:** n8n API, Google Drive OAuth2.\n\n**Alerts:** On success, posts to Google Chat via **SW — Send Google Chat Alert** (webhook from CONFIG secrets).\n\n**Config:** Drive paths come from **CONFIG — Global Settings** → `workflowBackup`.\n\n**Schedule:** Every 12 hours (+ Manual).',
          },
        }
      }
      if (n.type === 'n8n-nodes-base.stickyNote' && n.name === 'Sticky Note1') {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            content:
              '## Flow\n1. **Call CONFIG** → **Config** (merges `workflowBackup` + timestamps)\n2. **Create GDrive Folder** → **Get All Workflows** → loop: JSON → **Upload to Google Drive**\n3. **Final Summary** → **Prep backup complete Chat** → **Send backup complete Chat**\n\n**Drive layout:** timestamped folder on the shared drive; each workflow as `YYYY/MM/Name__id.json`.',
          },
        }
      }
      return n
    })

  const connections = structuredClone(wf.connections)

  for (const name of [
    'Check if File Exists',
    'File Exists?',
    'Create GitHub File',
    'Update GitHub File',
    'Merge GitHub Results',
  ]) {
    delete connections[name]
  }

  if (connections['Prepare GitHub Data']) {
    connections['Prepare Backup Data'] = connections['Prepare GitHub Data']
    delete connections['Prepare GitHub Data']
  }

  const loop = connections['Loop Over Workflows']
  if (loop?.main?.[1]) {
    for (const e of loop.main[1]) {
      if (e.node === 'Prepare GitHub Data') e.node = 'Prepare Backup Data'
    }
  }

  connections['Upload to Google Drive'] = {
    main: [[{ node: 'Edit Fields1', type: 'main', index: 0 }]],
  }

  return {
    ...wf,
    name: 'Automated workflow backup — Google Drive (alerts)',
    description:
      'Runs on a schedule to export all n8n workflows as JSON and back them up to Google Drive. Sends Google Chat alerts on completion.',
    nodes,
    connections,
  }
}

async function main() {
  loadEnvLocal()
  const root = baseUrl()
  const key = (process.env.N8N_API_KEY || '').trim()
  if (!root || !key) {
    console.error('Set N8N_API_URL and N8N_API_KEY (e.g. apps/iw-site/.env.local).')
    process.exit(1)
  }
  const apiRoot = `${root}/api/v1`
  const raw = await fetchJson(`${apiRoot}/workflows/${WORKFLOW_ID}`, key)
  const patched = patchWorkflow(raw)

  const body = JSON.stringify({
    name: patched.name,
    nodes: patched.nodes,
    connections: patched.connections,
    settings: pickSettings(patched.settings || {}),
    staticData: patched.staticData ?? null,
    pinData: patched.pinData ?? {},
  })

  const res = await fetch(`${apiRoot}/workflows/${encodeURIComponent(WORKFLOW_ID)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': key },
    body,
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(res.status, text.slice(0, 2000))
    process.exit(1)
  }

  const { meta, versionId, activeVersion, shared, tags, activeVersionId, updatedAt, ...rest } = patched
  writeFileSync(OUT_FILE, JSON.stringify(rest, null, 2))
  console.log('Updated n8n workflow', WORKFLOW_ID, 'OK')
  console.log('Wrote', OUT_FILE)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
