const input = $input.first()?.json || {};
return [{ json: {
  execution_id: $execution.id,
  slot: input.pipelineSlot || 'unknown',
  post_type: input.postType || 'unknown',
  status: 'skipped',
  headline: '',
  topic: '',
  postiz_id: '',
  error_message: 'Mutex blocked — another run in progress',
  duration_ms: 0,
  created_at: new Date().toISOString(),
} }];
