const input = $input.first()?.json || {};
const topStories = input.topStories || [];

const BREAKING_ENTITIES = [
  'openai', 'anthropic', 'google', 'apple', 'microsoft', 'github', 'docker', 'vercel',
  'react', 'next.js', 'nextjs', 'typescript', 'cloudflare', 'aws', 'meta', 'nvidia',
];

const BREAKING_SIGNALS = ['launch', 'released', 'announces', 'announcement', 'breaking', 'unveils', 'introduces', 'acquires', 'acquisition', 'outage', 'breach'];

function normalize(text) {
  return String(text || '').toLowerCase();
}

function scoreBreaking(story) {
  const hay = normalize(`${story.title} ${story.summary}`);
  let score = Number(story.score) || 0;
  for (const entity of BREAKING_ENTITIES) if (hay.includes(entity)) score += 12;
  for (const signal of BREAKING_SIGNALS) if (hay.includes(signal)) score += 6;
  const ageHours = (Date.now() - new Date(story.publishedAt).getTime()) / 3600000;
  if (ageHours <= 12) score += 10;
  else if (ageHours <= 24) score += 5;
  return score;
}

const ranked = topStories.map((s) => ({ ...s, breakingScore: scoreBreaking(s) })).sort((a, b) => b.breakingScore - a.breakingScore);
const top = ranked[0];
const isBreaking = top && top.breakingScore >= 28;

if (isBreaking) {
  return [{ json: {
    ...input,
    category: 'tech_news',
    categoryLabel: "Breaking Tech News",
    categoryFocus: 'major technology announcement override',
    topic: top.title,
    selectedStory: top,
    breakingNewsOverride: true,
    overrideReason: `Breaking story detected (score ${top.breakingScore}): ${top.title}`,
    topStories: ranked,
  } }];
}

return [{ json: {
  ...input,
  breakingNewsOverride: false,
  topStories: ranked,
  selectedStory: top || null,
} }];
