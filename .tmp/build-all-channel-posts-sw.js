function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const channels = $('Postiz - Get Channels').all().map((item) => item.json);
const input = safeNode('Execute Workflow Trigger') || {};
const upload = input.id && input.path ? input : (safeNode('Postiz') || {});

const limits = { threads: 500, bluesky: 300, linkedin: 3000, x: 280, twitter: 280, facebook: 63206, instagram: 2200 };

function contentForPlatform(platform) {
  const long = input.message || input.headline || input.short_message || '';
  const short = input.short_message || input.headline || long;
  const max = limits[platform];
  if (max && (platform === 'threads' || platform === 'bluesky' || platform === 'x' || platform === 'twitter')) {
    return short.length <= max ? short : `${short.slice(0, max - 3)}...`;
  }
  if (max && long.length > max) return `${long.slice(0, max - 3)}...`;
  return long;
}

function platformSettings(platform) {
  const settings = { __type: platform };
  if (platform === 'instagram' || platform === 'instagram-standalone') settings.post_type = 'post';
  if (platform === 'facebook') settings.post_type = 'post';
  return settings;
}

const imageAttachment = upload?.id && upload?.path ? [{ id: upload.id, path: upload.path }] : [];
const publishNow = input.publishNow === true;
const postType = input.postType || 'primary';

const posts = channels.filter((c) => !c.disabled).map((channel) => {
  const platform = channel.identifier || channel.platform;
  return {
    integration: { id: channel.id },
    value: [{ content: contentForPlatform(platform), id: '', image: imageAttachment }],
    group: '',
    settings: platformSettings(platform),
  };
});

return [{ json: {
  type: publishNow ? 'now' : 'draft',
  shortLink: false,
  date: new Date().toISOString(),
  tags: [{ value: postType }],
  posts,
  channelCount: posts.length,
  postType,
  publishNow,
  mediaUploadFailed: input.mediaUploadFailed === true,
} }];
