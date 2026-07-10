// Editorial Scheduler — single source of truth for daily content decisions.
// Priority: breaking news override (downstream) > weekly schedule > evergreen > backlog.

const TZ = 'America/New_York';
const input = $input.first()?.json || {};
const pipelineSlot = input.pipelineSlot || 'research';
const contentType = input.contentType || 'linkedin_post';

const WEEKLY = {
  1: { category: 'tech_news', label: "Today's Tech News", focus: 'biggest engineering or technology story', examples: ['AI', 'Open Source', 'Cloud', 'Microsoft', 'Google', 'Apple', 'GitHub', 'Vercel', 'Docker'] },
  2: { category: 'software_engineering', label: 'Software Engineering', focus: 'architecture, patterns, and craft', examples: ['Architecture', 'Design Patterns', 'Performance', 'Testing', 'TypeScript', 'React', 'Next.js'] },
  3: { category: 'ai', label: 'AI', focus: 'LLMs, tooling, and agentic workflows', examples: ['LLMs', 'AI tooling', 'Agentic workflows', 'MCP', 'Prompt Engineering', 'Automation', 'AI development'] },
  4: { category: 'deep_dive', label: 'Engineering Deep Dive', focus: 'long-form educational technical post', examples: ['System Design', 'Scalability', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Event Driven Architecture'], longForm: true },
  5: { category: 'weekly_roundup', label: 'Weekly Roundup', focus: 'summarize the week: biggest announcement, release, lesson, and what to watch', examples: ['weekly technology roundup'] },
  6: { category: 'career', label: 'Career / Productivity', focus: 'leadership, productivity, and engineering culture', examples: ['Leadership', 'Developer productivity', 'Remote work', 'Interview advice', 'Lessons learned', 'Engineering culture'] },
  0: { category: 'evergreen', label: 'Evergreen', focus: 'best practices, tutorials, and timeless lessons', examples: ['Best practices', 'Tutorials', 'Coding tips', 'Architecture diagrams', 'Historical technology lessons'], optionalSkip: true },
};

const FALLBACK_TOPICS = [
  'engineering best practice',
  'architecture lesson',
  'React tip',
  'Next.js optimization',
  'TypeScript insight',
  'Docker workflow',
  'PostgreSQL tip',
  'AI automation tutorial',
];

const CATEGORY_MIX = {
  tech_news: 0.20,
  ai: 0.20,
  software_engineering: 0.20,
  deep_dive: 0.15,
  career: 0.10,
  weekly_roundup: 0.10,
  evergreen: 0.05,
};

function dayOfWeekEt() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).formatToParts(new Date());
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[parts.find((p) => p.type === 'weekday')?.value || 'Mon'] ?? 1;
}

function todayEt() {
  return $now.format('yyyy-MM-dd');
}

const dow = dayOfWeekEt();
const scheduled = WEEKLY[dow] || WEEKLY[1];
const historyRows = $('Load Editorial History').all().map((i) => i.json);

const MIN_CATEGORY_SPACING_DAYS = 14;
const PREFERRED_CATEGORY_SPACING_DAYS = 30;

function daysBetween(a, b) {
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (!da || !db) return 999;
  return Math.abs(da - db) / 86400000;
}

function recentCategories() {
  const today = todayEt();
  return historyRows
    .filter((r) => r.published === true || r.published === 'true')
    .map((r) => ({ category: r.category, daysAgo: daysBetween(today, r.date) }))
    .filter((r) => r.category);
}

function pickRotatedCategory(baseCategory) {
  const recent = recentCategories();
  const tooRecent = new Set(
    recent.filter((r) => r.daysAgo < MIN_CATEGORY_SPACING_DAYS).map((r) => r.category),
  );
  if (!tooRecent.has(baseCategory)) return baseCategory;

  const candidates = Object.keys(CATEGORY_MIX)
    .filter((c) => !tooRecent.has(c))
    .sort((a, b) => {
      const aLast = recent.find((r) => r.category === a)?.daysAgo ?? 999;
      const bLast = recent.find((r) => r.category === b)?.daysAgo ?? 999;
      return bLast - aLast;
    });
  return candidates[0] || baseCategory;
}

const category = pickRotatedCategory(scheduled.category);
const schedule = WEEKLY[Object.entries(WEEKLY).find(([, v]) => v.category === category)?.[0] ?? dow] || scheduled;

const exampleTopic = schedule.examples[Math.floor(Math.random() * schedule.examples.length)];
const fallbackTopic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];

const skipSundayEvergreen = schedule.optionalSkip === true && pipelineSlot === 'publish';

return [{ json: {
  ...input,
  pipelineSlot,
  contentType,
  postType: 'primary',
  publishNow: pipelineSlot === 'publish',
  scheduledCategory: scheduled.category,
  category,
  categoryLabel: schedule.label,
  categoryFocus: schedule.focus,
  categoryExamples: schedule.examples,
  topic: `${schedule.label}: ${exampleTopic}`,
  fallbackTopic,
  longForm: schedule.longForm === true,
  skipPublish: skipSundayEvergreen,
  skipResearch: category === 'evergreen' || category === 'career' || category === 'deep_dive',
  editorialDate: todayEt(),
  timezone: TZ,
  pickedAt: new Date().toISOString(),
} }];
