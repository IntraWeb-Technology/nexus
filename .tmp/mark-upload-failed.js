const post = $('Parse Post JSON').first()?.json || $('Load Primary Draft').first()?.json || $('Validate Draft').first()?.json || $input.first()?.json || {};
const err = $input.first()?.json?.error || {};
return [{ json: {
  ...post,
  mediaUploadFailed: true,
  uploadError: err.message || err.description || 'Postiz upload failed',
} }];
