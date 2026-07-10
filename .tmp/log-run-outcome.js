function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const staticData = $getWorkflowStaticData('global');
const startedAt = staticData.runStartedAt || Date.now();
const post = safeNode('Run Collect Research') || safeNode('Run Publish Postiz') || safeNode('Run Generate Media') || safeNode('Load Primary Draft') || safeNode('Validate Draft') || {};
const slot = safeNode('Acquire Mutex') || {};
const postiz = safeNode('Run Publish Postiz') || {};
const uploadFailed = safeNode('Run Generate Media');

let status = 'success';
let errorMessage = '';
if (uploadFailed?.mediaUploadFailed) {
  status = 'partial';
  errorMessage = uploadFailed.uploadError || 'Postiz media upload failed; posted text-only';
}
if (postiz.status === 'error' || postiz.error) {
  status = 'error';
  errorMessage = postiz.error?.message || postiz.uploadError || JSON.stringify(postiz.error || postiz).slice(0, 500);
}

return [{ json: {
  execution_id: $execution.id,
  slot: slot.pipelineSlot || post.pipelineSlot || 'unknown',
  post_type: post.postType || slot.postType || 'primary',
  status,
  headline: post.headline || '',
  topic: post.topic || '',
  postiz_id: String(postiz.id || postiz.postId || postiz.data?.id || ''),
  error_message: errorMessage,
  duration_ms: Date.now() - startedAt,
  created_at: new Date().toISOString(),
} }];
