// Merged: select best draft + parse JSON + validate quality + first comment

function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

function extractJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const cleaned = rawText.replace(/^```json\s*|```\s*$/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function writerText(writer) {
  if (!writer || typeof writer !== 'object') return '';
  if (typeof writer.text === 'string') return writer.text;
  if (Array.isArray(writer.content)) {
    return writer.content.find((c) => c.type === 'text')?.text || writer.content.map((c) => c.text || '').join('\n');
  }
  return '';
}

const planner = safeNode('Editorial Planner') || {};
const research = safeNode('Format Research') || {};
const stories = research.stories || [];
const citations = research.citations || [];
const sourceUrlsFromText = research.sourceUrlsFromText || [];
const writerItem = $('AI Writer').first()?.json || {};

let parsed = extractJsonObject(writerText(writerItem));
if (!parsed) parsed = {};

const draft = {
  headline: parsed.headline || '',
  message: parsed.message || '',
  short_message: parsed.short_message || '',
  story_index: Number(parsed.story_index) || 1,
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
  const top = planner.topStories || [];
  if (isValidUrl(top[storyIndex - 1]?.link)) return top[storyIndex - 1].link;
  if (isValidUrl(planner.selectedStory?.link)) return planner.selectedStory.link;
  for (const url of [citations[storyIndex - 1], citations[0], sourceUrlsFromText[0]]) {
    if (isValidUrl(url)) return url;
  }
  return '';
}
function stripUrls(input) {
  return (input || '').replace(/https?:\/\/[^\s\)\]"'<>]+/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}

function buildFirstComment(primaryUrl, body) {
  const lines = [];
  if (primaryUrl) lines.push(primaryUrl);
  const questionMatch = body.match(/([^\n?]*\?)\s*$/);
  const hook = questionMatch
    ? questionMatch[1].trim()
    : 'What stood out to you in this story?';
  if (hook && (!lines.length || !lines.join('\n').includes(hook))) {
    if (lines.length) lines.push('');
    lines.push(hook);
  }
  return lines.join('\n').trim();
}

const storyIndex = Number(draft.story_index) || 1;
const primaryUrl = urlForStoryIndex(storyIndex);
const rawMessage = draft.message || draft.short_message || '';
const message = stripUrls(rawMessage);
const shortMessage = stripUrls(draft.short_message || draft.message || '');
const firstComment = buildFirstComment(primaryUrl, rawMessage);

let validPost = true;
let invalidReason = '';
const msg = String(message || '').trim();
if (!draft.headline || !msg || msg.startsWith('{') || msg.length < 80) {
  validPost = false;
  invalidReason = 'Draft failed quality check: missing headline or substantive message';
}

return [{ json: {
  headline: draft.headline || '',
  message,
  short_message: shortMessage,
  firstComment,
  topic: planner.topic || research.topic || '',
  category: planner.category,
  categoryLabel: planner.categoryLabel,
  contentType: planner.contentType || 'linkedin_post',
  story_index: storyIndex,
  story_title: stories.find((s) => s.index === storyIndex)?.title || planner.selectedStory?.title || '',
  primaryUrl,
  validPost,
  invalidReason,
} }];
