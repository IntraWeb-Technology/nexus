function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const selected = safeNode('Select Best Draft') || $input.first()?.json || {};
const research = safeNode('Format Research') || {};
const stories = research.stories || [];
const citations = research.citations || [];
const sourceUrlsFromText = research.sourceUrlsFromText || [];
const topicData = safeNode('Collect and Score Sources') || safeNode('Topic') || {};

const post = {
  headline: selected.headline || '',
  message: selected.message || '',
  short_message: selected.short_message || '',
  story_index: Number(selected.story_index) || 1,
};

function cleanUrl(url) { return (url || '').trim().replace(/[.,;:!?\)\]]+$/, ''); }
function isValidUrl(url) { return typeof url === 'string' && /^https?:\/\//i.test(cleanUrl(url)); }
function extractSourceUrls(blockText) {
  return [...blockText.matchAll(/^Source URL:\s*(https?:\/\/[^\s\)\]"'<>]+)/gim)].map((m) => cleanUrl(m[1]));
}
function splitStoryBlocks(blockText) {
  return blockText.replace(/\r/g, '').split(/(?:^|\n)---+(?:\n|$)/).map((b) => b.trim()).filter((b) => /STORY\s+\d+/i.test(b));
}
function urlForStoryIndex(storyIndex) {
  const story = stories.find((s) => s.index === storyIndex);
  if (story?.primaryUrl && isValidUrl(story.primaryUrl)) return story.primaryUrl;
  const blocks = splitStoryBlocks(research.researchText || '');
  const block = blocks.find((b) => new RegExp(`STORY\\s+${storyIndex}`, 'i').test(b)) || blocks[storyIndex - 1] || blocks[0];
  if (block) { const urls = extractSourceUrls(block); if (isValidUrl(urls[0])) return urls[0]; }
  const collected = safeNode('Collect and Score Sources')?.topStories || [];
  if (isValidUrl(collected[storyIndex - 1]?.link)) return collected[storyIndex - 1].link;
  for (const url of [citations[storyIndex - 1], citations[0], sourceUrlsFromText[storyIndex - 1], sourceUrlsFromText[0]]) {
    if (isValidUrl(url)) return url;
  }
  return '';
}
function stripUrls(input) {
  return (input || '').replace(/https?:\/\/[^\s\)\]"'<>]+/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}
function attachSource(body, url) {
  const cleaned = stripUrls(body);
  const link = cleanUrl(url);
  if (!link || cleaned.includes(link)) return cleaned;
  return `${cleaned}\n\n${link}`;
}

const storyIndex = Number(post.story_index) || 1;
const primaryUrl = urlForStoryIndex(storyIndex);

return [{ json: {
  headline: post.headline || '',
  message: attachSource(post.message || post.short_message || '', primaryUrl),
  short_message: attachSource(post.short_message || post.message || '', primaryUrl),
  topic: selected.topic || research.topic || topicData.topic || '',
  postType: selected.postType || research.postType || topicData.postType || 'primary',
  pipelineSlot: selected.pipelineSlot || research.pipelineSlot || topicData.pipelineSlot || 'publish',
  publishNow: selected.publishNow ?? research.publishNow ?? topicData.publishNow ?? false,
  story_index: storyIndex,
  story_title: stories.find((s) => s.index === storyIndex)?.title || '',
  primaryUrl,
  citations,
} }];
