function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const channels = $('Postiz - Get Channels').all().map((item) => item.json);
const upload = safeNode('Postiz - Upload') || {};
const post = safeNode('Prepare Post') || {};

const limits = {
  threads: 500, bluesky: 300, linkedin: 3000, 'linkedin-page': 3000,
  x: 280, twitter: 280, facebook: 63206, instagram: 2200, 'instagram-standalone': 2200,
};

const COMMENT_DELAY_MS = {
  x: 120000, twitter: 120000, threads: 120000, bluesky: 120000,
  linkedin: 120000, 'linkedin-page': 120000,
  instagram: 120000, 'instagram-standalone': 120000,
  facebook: 120000, reddit: 120000, default: 120000,
};

function stripUrls(text) {
  return (text || '').replace(/https?:\/\/[^\s\)\]"'<>]+/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}

function trimTo(text, max) {
  if (!max || text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function contentForPlatform(platform, long, short) {
  const useShort = ['threads', 'bluesky', 'x', 'twitter'].includes(platform);
  const body = useShort ? (short || long) : (long || short);
  return trimTo(body, limits[platform]);
}

function commentForPlatform(platform, comment) {
  if (!comment) return '';
  return trimTo(comment, limits[platform]);
}

function platformSettings(platform) {
  const settings = { __type: platform };
  if (platform === 'instagram' || platform === 'instagram-standalone') settings.post_type = 'post';
  if (platform === 'facebook') settings.post_type = 'post';
  return settings;
}

const headline = String(post.headline || '').trim();
const mainBody = stripUrls(post.message || post.short_message || '');
const shortBody = stripUrls(post.short_message || post.message || '');
const longMain = headline ? `${headline}\n\n${mainBody}` : mainBody;
const shortMain = headline ? `${headline}\n\n${shortBody}` : shortBody;

const firstComment = String(post.firstComment || '').trim();
const imageAttachment = upload?.id && upload?.path ? [{ id: upload.id, path: upload.path }] : [];

const posts = channels.filter((c) => !c.disabled).map((channel) => {
  const platform = channel.identifier || channel.platform;
  const mainContent = contentForPlatform(platform, longMain, shortMain);
  const value = [{ content: mainContent, id: '', image: imageAttachment }];

  const commentText = commentForPlatform(platform, firstComment);
  if (commentText) {
    value.push({
      content: commentText,
      id: '',
      image: [],
      delay: COMMENT_DELAY_MS[platform] || COMMENT_DELAY_MS.default,
    });
  }

  return {
    integration: { id: channel.id },
    value,
    group: '',
    settings: platformSettings(platform),
  };
});

return [{ json: {
  type: 'draft',
  shortLink: false,
  date: new Date().toISOString(),
  tags: [{ value: post.category || 'primary' }],
  posts,
  channelCount: posts.length,
  hasFirstComment: !!firstComment,
  publishMode: 'draft',
} }];
