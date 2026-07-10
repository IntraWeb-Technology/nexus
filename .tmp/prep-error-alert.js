const post = $('Parse Post JSON').first()?.json || $('Load Primary Draft').first()?.json || $('Validate Draft').first()?.json || {};
const slot = $('Acquire Mutex').first()?.json || {};
const err = $input.first()?.json?.error || $input.first()?.json || {};
const msg = err.message || err.description || JSON.stringify(err).slice(0, 500);
return [{ json: {
  priority: 'error',
  message: `Social pipeline failed (${slot.postType || post.postType || 'unknown'} / ${slot.pipelineSlot || 'publish'}): ${post.headline || post.topic || 'no headline'} — ${msg}`,
} }];
