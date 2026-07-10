const input = $input.first()?.json || {};
return [{ json: {
  execution_id: $execution.id,
  slot: input.pipelineSlot || 'skipped',
  post_type: input.postType || 'primary',
  status: 'skipped',
  headline: '',
  topic: input.topic || input.duplicateReason || input.mutexReason || 'skipped',
  postiz_id: '',
  error_message: input.duplicateReason || input.mutexReason || input.message || 'Run skipped',
  duration_ms: 0,
  created_at: new Date().toISOString(),
} }];
