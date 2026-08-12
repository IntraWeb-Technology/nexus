/**
 * Build portal ingest payload after Postiz draft creation.
 * n8n Code node — run once after Create Postiz drafts.
 */
function safeNode(name) {
  try {
    return $(name).first()?.json || null
  } catch {
    return null
  }
}

const TZ = 'America/New_York'
const WORKFLOW_ID = 'gHdJOdGpVHf6POqo'
const WORKFLOW_NAME = 'Content Pipeline — Editorial Calendar'

const post = safeNode('Prepare Post') || safeNode('Prepare post') || {}
const slotDate =
  post.slot_date ||
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

const executionId = String($execution.id || '')
const postizResponse = safeNode('Postiz - Create Drafts') || safeNode('Create Postiz drafts') || {}

const publications = []
const channels = $('Postiz - Get Channels').all().map((item) => item.json)
const draftPosts = Array.isArray(postizResponse?.posts) ? postizResponse.posts : []

for (const channel of channels.filter((c) => !c.disabled)) {
  const platform = channel.identifier || channel.platform || 'unknown'
  const integrationId = channel.id ? String(channel.id) : null
  const draftMatch = draftPosts.find((d) => String(d?.integration?.id || '') === integrationId)
  publications.push({
    platform,
    publisher: 'postiz',
    postiz_batch_id: postizResponse?.id ? String(postizResponse.id) : null,
    postiz_post_id: draftMatch?.id ? String(draftMatch.id) : null,
    postiz_integration_id: integrationId,
    payload_snapshot: draftMatch || {},
    publisher_response_snapshot: postizResponse || {},
  })
}

if (!publications.length) {
  throw new Error('No platform publications to ingest')
}

const idempotencyKey = `editorial:${slotDate}:primary`

return [
  {
    json: {
      command: 'ingest_editorial_draft',
      workflow: {
        name: WORKFLOW_NAME,
        workflow_id: WORKFLOW_ID,
        execution_id: executionId,
        slot_date: slotDate,
      },
      canonical: {
        editorial_category: post.category || 'tech_news',
        topic: post.topic || '',
        headline: post.headline || '',
        body_long: post.message || post.body_long || '',
        body_short: post.short_message || post.body_short || '',
        primary_url: post.primaryUrl || post.primary_url || null,
        quality_score: post.quality_score ?? null,
        novelty_score: post.novelty_score ?? null,
      },
      publications,
      review: {
        review_scope: 'publication_group',
        risk_level: 'medium',
      },
      idempotency_key: idempotencyKey,
    },
  },
]
