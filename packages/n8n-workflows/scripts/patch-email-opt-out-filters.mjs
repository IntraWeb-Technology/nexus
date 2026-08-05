/**
 * Adds email_opt_out checks to reactivation + outbound sequences.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function patchFilterInactive(jsCode) {
  if (jsCode.includes('email_opt_out')) return jsCode
  return jsCode.replace(
    'if (flagIsTrue(p.replied_flag) || flagIsTrue(p.booking_flag)) return false;',
    'if (flagIsTrue(p.replied_flag) || flagIsTrue(p.booking_flag) || flagIsTrue(p.email_opt_out)) return false;',
  )
}

function patchHubSpotGetAll(params) {
  const props = params?.options?.properties
  if (!Array.isArray(props) || props.includes('email_opt_out')) return params
  props.push('email_opt_out')
  return params
}

function patchOutboundIf(conditions) {
  if (!conditions?.conditions) return conditions
  const hasOptOut = conditions.conditions.some((c) =>
    String(c.leftValue || '').includes('email_opt_out'),
  )
  if (hasOptOut) return conditions
  conditions.conditions.push({
    id: `optout-${conditions.conditions.length + 1}`,
    leftValue: '={{ $json.properties.email_opt_out }}',
    rightValue: 'true',
    operator: { type: 'string', operation: 'notEquals' },
  })
  return conditions
}

function patchWorkflow(filePath) {
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  function patchSection(section) {
    for (const node of section.nodes || []) {
      if (node.id === 'sys11-react-filter' && node.parameters?.jsCode) {
        node.parameters.jsCode = patchFilterInactive(node.parameters.jsCode)
      }
      if (node.id === 'b2077dfe-b522-4723-9662-7906bc19059d' && node.parameters) {
        node.parameters = patchHubSpotGetAll(node.parameters)
      }
      if (
        node.type === 'n8n-nodes-base.hubspot' &&
        node.parameters?.additionalFields?.properties &&
        !node.parameters.additionalFields.properties.includes('email_opt_out')
      ) {
        node.parameters.additionalFields.properties.push('email_opt_out')
      }
      if (node.type === 'n8n-nodes-base.if' && node.name?.startsWith('Continue?')) {
        node.parameters.conditions = patchOutboundIf(node.parameters.conditions)
      }
    }
  }

  patchSection(wf)
  if (wf.activeVersion) patchSection(wf.activeVersion)
  fs.writeFileSync(filePath, `${JSON.stringify(wf, null, 2)}\n`, 'utf8')
  console.log('Patched', filePath)
}

patchWorkflow(path.join(root, '05_client-success/SYS 05 — Referral and Reactivation Engine.json'))
patchWorkflow(path.join(root, '02_outreach/SYS 02 — Outbound Lead Outreach Sequence.json'))
