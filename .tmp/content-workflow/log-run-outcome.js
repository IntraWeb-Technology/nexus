function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const staticData = $getWorkflowStaticData('global');
const startedAt = staticData.runStartedAt || Date.now();
const slot = safeNode('Init Research Slot') || safeNode('Init Generate Slot') || safeNode('Init Validate Slot') || safeNode('Init Publish Slot') || {};
const parsed = safeNode('Parse Post JSON') || safeNode('Load Primary Draft') || safeNode('Validate Draft') || {};
const postiz = safeNode('Postiz - Post') || {};

let status = 'success';
let errorMessage = '';
if (postiz.error) {
  status = 'error';
  errorMessage = String(postiz.error.message || postiz.error).slice(0, 500);
}

return [{ json: {
  execution_id: $execution.id,
  slot: slot.pipelineSlot || 'unknown',
  post_type: slot.postType || 'primary',
  status,
  headline: parsed.headline || '',
  topic: parsed.topic || '',
  postiz_id: String(postiz.id || postiz.postId || ''),
  error_message: errorMessage,
  duration_ms: Date.now() - startedAt,
  created_at: new Date().toISOString(),
} }];
