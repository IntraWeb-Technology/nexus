const d = $('Extract Deal Data').first().json;

const fmtMoney = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x);
};

const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsSubtotalCalc =
  Number(d.lineItemsSubtotal) || lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0);
const discClaude = Math.max(0, Number(d.totalDiscount) || 0);
const quotedForPrompt =
  lineItemsSubtotalCalc > 0
    ? Math.max(0, lineItemsSubtotalCalc - discClaude)
    : (Number(d.dealAmount) || 0) > 0
      ? Number(d.dealAmount)
      : Number(d.tierAmount) || 0;
const upfront40 = Math.round(quotedForPrompt * 0.4 * 100) / 100;
const remainderAfterUpfront = Math.max(0, quotedForPrompt - upfront40);

const isRecLine = (name) => {
  const n = String(name || '').toLowerCase();
  return /\bretainer\b/.test(n) || /\bmaintenance\b/.test(n) || /\bmonthly\b/.test(n);
};
const monthlyFromLines = lineItems
  .filter((li) => isRecLine(li.name))
  .reduce((s, li) => s + (Number(li.amount) || 0), 0);

const lineItemsBlock = lineItems.length
  ? lineItems
      .map(
        (li, i) =>
          `  ${i + 1}. ${li.name || 'Item'} - ${fmtMoney(li.amount)}\n` +
          (li.description ? `     Notes: ${li.description}\n` : ''),
      )
      .join('')
  : '(No line items in payload - scope from tier and website intake only.)';

const lineItemsRules = lineItems.length
  ? 'When LINE ITEMS are present: treat each line item as a distinct sellable component (e.g. website vs automation). Include at least one scope block that maps to each line item by name, in addition to tying work to website intake. Min 2, max 4 blocks total.'
  : 'one scope block per major intake theme. Min 2, max 4 blocks.';

const nz = (v, fallback = 'Not provided') => {
  const s = String(v ?? '').trim();
  return s || fallback;
};

const lineItemNames = lineItems.length
  ? lineItems.map((li) => (li.name || 'Item').trim()).filter(Boolean).join(', ')
  : 'none';

const recurringNote =
  monthlyFromLines > 0.005
    ? `Recurring amounts appear only as line items: ${fmtMoney(monthlyFromLines)} (do not add template tier monthly).`
    : 'Monthly retainer is not included in the quoted project total unless it appears as a line item (often separate).';

const dealTierExact = nz(d.dealTierHubspot || d.hubspotTierRaw || d.tierLabel, 'Not set');

const mandatoryScopeTitles =
  lineItems.length > 0
    ? lineItems
        .map(
          (li, i) =>
            `${i + 1}. The scope block H3 / deliverable title MUST be exactly: ${JSON.stringify(li.name || 'Item')} (${fmtMoney(li.amount)})`,
        )
        .join('\n')
    : 'No line items on this deal. Build Detailed Scope only from WEBSITE INTAKE (pages, features, goals). Minimum 2 scope blocks. Do not invent SKUs or products not implied by intake.';

const commercialContext = [
  `Deal ID: ${nz(d.dealId)}`,
  `Deal tier: use the deal property "tier" verbatim in Executive Summary paragraph 1 when set: ${nz(d.dealTierHubspot, '(not set)')}`,
  `Deal tier display (tier, or label fallback): ${dealTierExact}`,
  `Client / deal name: ${nz(d.clientName)}`,
  `Company: ${nz(d.companyDisplay || d.company)}`,
  `Industry: ${nz(d.industryDisplay || d.industry)}`,
  `Primary contact: ${nz(d.contactName || d.contactFirstName)}`,
  `Contact email: ${nz(d.contactEmailDisplay || d.contactEmail)}`,
  `Contact phone: ${d.contactPhone ? String(d.contactPhone).trim() : 'Not provided'}`,
  '',
  'DELIVERABLES (line items from the deal; scope section MUST mirror these titles exactly when present):',
  mandatoryScopeTitles,
  '',
  'INVESTMENT (must match the PDF investment summary; use these dollar amounts only):',
  `- Deal amount (reference when no line items): ${fmtMoney(d.dealAmount)}`,
  `- Line item count: ${lineItems.length} (${lineItemNames})`,
  `- Line items subtotal: ${fmtMoney(lineItemsSubtotalCalc)}`,
  `- Quoted total (after discounts when line items exist, else deal or tier amount): ${fmtMoney(quotedForPrompt)}`,
  `- Total discount (deal-level, if any): ${fmtMoney(d.totalDiscount)}`,
  `- Deal tier: ${dealTierExact}`,
  `- Upfront due (40% of quoted total): ${fmtMoney(upfront40)}`,
  `- Remaining balance after upfront: ${fmtMoney(remainderAfterUpfront)}`,
  `- ${recurringNote}`,
].join('\n');

const stripJsonTail = (text) => {
  let s = String(text || '');
  const idx = s.search(/\nWebsite intake \(JSON\):/i);
  if (idx !== -1) s = s.slice(0, idx);
  const idx2 = s.search(/\nWebsite intake \(structured fields\):/i);
  if (idx2 !== -1) s = s.slice(0, idx2);
  return s.trim();
};

const whatYouToldUsSource =
  String(d.websiteIntakeJsonText || '').trim() ||
  String(d.intakeForWhatWeHeard || '').trim() ||
  stripJsonTail(String(d.rawPainPoints || '').trim()) ||
  stripJsonTail(String(d.painPoints || '').trim()) ||
  '(None provided)';

const fullContextNotes = stripJsonTail(
  String(d.websiteIntakeJsonText || d.rawPainPoints || d.painPoints || whatYouToldUsSource || '').slice(0, 14000),
);

return [
  {
    json: {
      systemPrompt: `You are writing a consulting proposal body for IntraWeb Technologies LLC.
Tone: neutral, factual, and professional. Prefer plain statements over promotion. Avoid superlatives, hype, urgency selling, and claims like "eliminates", "from day one", or "fastest".
Language: boardroom-appropriate only. Never output profanity, vulgar slang, slurs, or insulting labels even when WEBSITE INTAKE uses them. Rephrase the underlying intent in neutral, respectful language (for example contrast with generic flashy wellness-influencer stereotypes instead of repeating coarse wording).

OUTPUT RULES:
- First, output two plain-text blocks for the PDF shell (no HTML inside either block, no text before the first opening delimiter), in this exact order:
<<<PAIN_SUMMARY>>>
Write 4-6 professional, client-facing sentences summarizing ONLY the website intake JSON and related intake notes: business context, stated goals, audience, timeline, design/content preferences, and requested integrations. Do not invent facts. Do not use em dashes or en dashes (Unicode U+2013/U+2014); use commas or hyphen-minus only. Do not mention the client's budget, budget range, funding preference, or any dollar amounts or thresholds (including phrases like "under $X" or "budget under"); commercial figures belong only in the Investment summary section and line-item table, not in this narrative. Keep vocabulary professional; if intake includes coarse or vulgar wording, summarize the idea without repeating those words.
<<<END_PAIN_SUMMARY>>>
<<<INVESTMENT_SUMMARY>>>
Write 2-4 professional sentences for the "Investment summary" lead-in above the line-item table. Describe the proposed services or package components, how they fit the engagement, and tier (if applicable) at a high level. Do not include any dollar amounts, currency symbols, prices, or the words USD, total, subtotal, or quoted in a pricing sense—dollar amounts appear only in the PDF table from HubSpot. Do not use em dashes or en dashes; use commas or hyphen-minus only.
<<<END_INVESTMENT_SUMMARY>>>
- After those blocks, return ONLY the inner HTML body content. No DOCTYPE, no <html>, no <head>, no <body> tags.
- No markdown. No backticks. No prose outside of HTML tags.
- The PDF shell already renders header, client snapshot, a short intake or pain summary, an investment lead-in paragraph, the line-item table, and footer - do NOT repeat those in the HTML body.
- Implementation Roadmap MUST be a 2x2 CSS grid (display:grid; grid-template-columns:1fr 1fr; gap:12px) - never a single-column stack.
- Expected Operational Outcomes MUST be a 3-column CSS grid (grid-template-columns:1fr 1fr 1fr; gap:10px) on wide layouts; if you must wrap, still use grid with two columns minimum - not one card per full row.
- Next Steps MUST use a 2x2 grid of styled cards (see pattern below) - not a vertical list.
- For every inline style color, border-color, and background, use ONLY CSS variables from this set (never raw hex): var(--iw-slate-950) through var(--iw-slate-50), var(--iw-teal), var(--iw-teal-light), var(--iw-teal-dim), var(--iw-teal-ghost), var(--iw-orange), var(--iw-orange-dim), var(--iw-orange-ghost), var(--iw-white), var(--iw-off-white). Example: color: var(--iw-slate-700);
- Prefer semantic <ul>/<li> for bullet lists inside scope blocks when listing deliverables or milestones.
- On every card, scope block, phase block, outcome card, and each direct child of a CSS grid wrapper, include both break-inside: avoid and page-break-inside: avoid in the inline style (Chromium PDF print follows break-inside more reliably).
- ALWAYS keep the stable class names exactly as shown in the design-system patterns below ("pain-card", "scope-card", "roadmap-card", "outcome-card", "why-block", "next-step-card") on each card wrapper - the print stylesheet protects elements by class and the inline style is defense-in-depth only.

DESIGN SYSTEM - use these patterns (colors via variables only):

━━ SECTION TITLE ━━
<div style="font-size: 10pt; font-weight: 700; color: var(--iw-teal-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 10px;">Section Title</div>

━━ PROSE PARAGRAPHS ━━
<p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">Text here.</p>

━━ PAIN POINT CARD (use in "What You Told Us") ━━
<div class="pain-card" style="border: 0.5px solid var(--iw-slate-100); margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-50); padding: 8px 14px; border-bottom: 0.5px solid var(--iw-slate-100); font-size: 9pt; font-weight: 700; font-style: italic; color: var(--iw-slate-800);">[Short label taken from intake, e.g. Goals, Audience, Content]</div>
  <div style="padding: 10px 14px; font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[2-3 neutral sentences paraphrasing what they wrote in website intake, not generic consulting themes; sanitize any coarse or vulgar intake wording into professional language]</div>
</div>

━━ SCOPE BLOCK (one per major deliverable, in "Detailed Scope of Work") ━━
<div class="scope-card" style="margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-950); padding: 10px 14px;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-white);">[Deliverable Name]</div>
    <div style="font-size: 8.5pt; color: var(--iw-teal-light); margin-top: 3px; font-style: italic;">You said: [close paraphrase of intake in professional language, no em or en dashes; never quote profanity or vulgar slang verbatim]</div>
  </div>
  <div style="border: 0.5px solid var(--iw-slate-100); border-top: none; display: flex;">
    <div style="width: 3px; background: var(--iw-teal); flex-shrink: 0;"></div>
    <div style="padding: 10px 14px;">
      <div style="font-size: 9pt; color: var(--iw-slate-500); margin-bottom: 6px;">We will:</div>
      <ul style="margin:0;padding-left:18px;color:var(--iw-slate-800);font-size:9pt;line-height:1.55;">
        <li>[specific deliverable]</li>
        <li>[specific deliverable]</li>
        <li>[specific deliverable]</li>
      </ul>
    </div>
  </div>
</div>

━━ ROADMAP GRID (2x2, in "Implementation Roadmap") ━━
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;">
  [Repeat 4 times:]
  <div class="roadmap-card" style="border: 0.5px solid var(--iw-slate-100); break-inside: avoid; page-break-inside: avoid;">
    <div style="background: var(--iw-slate-950); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 9pt; font-weight: 700; color: var(--iw-white);">[Phase Name]</div>
      <div style="font-size: 8pt; font-weight: 700; color: var(--iw-teal-light);">Weeks [X-Y]</div>
    </div>
    <div style="padding: 10px 14px;">
      <ul style="margin:0;padding-left:18px;color:var(--iw-slate-800);font-size:9pt;">
        <li>[milestone]</li>
        <li>[milestone]</li>
      </ul>
    </div>
  </div>
</div>

━━ OUTCOMES GRID (3-column cards, in "Expected Operational Outcomes") ━━
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 4px;">
  [Repeat 5-6 times:]
  <div class="outcome-card" style="border: 0.5px solid var(--iw-slate-100); border-top: 2px solid var(--iw-teal); padding: 12px 14px; break-inside: avoid; page-break-inside: avoid;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 5px;">[Outcome Title]</div>
    <div style="font-size: 9pt; color: var(--iw-slate-500); line-height: 1.5;">[1-2 sentences, measurable, industry-specific; no em or en dashes]</div>
  </div>
</div>

━━ WHY INTRAWEB BLOCK (title must stay with the teal panel; avoid orphan headings across pages) ━━
<div class="why-block" style="break-inside: avoid-page; page-break-inside: avoid;">
  <div style="font-size: 10pt; font-weight: 700; color: var(--iw-teal-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 10px;">Why IntraWeb</div>
  <div style="background: var(--iw-teal-ghost); border: 0.5px solid var(--iw-slate-100); padding: 20px 24px; margin-bottom: 4px; break-inside: avoid; page-break-inside: avoid;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">[Paragraph 1: calm, neutral fit to their industry and intake. No slogans. No em or en dashes.]</p>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[Paragraph 2: matter-of-fact delivery and communication norms. No speed brags. No em or en dashes.]</p>
    </div>
    <div>
      [Repeat 3 times:]
      <div style="background: var(--iw-white); border: 0.5px solid var(--iw-slate-100); padding: 10px 14px; margin-bottom: 8px;">
        <div style="font-size: 9pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 3px;">[Neutral differentiator title: avoid "fast", "fastest", "instant". Examples: Integrated delivery, Phased rollout, Single-team ownership]</div>
        <div style="font-size: 8.5pt; color: var(--iw-slate-500);">[One factual sentence, no hype]</div>
      </div>
    </div>
  </div>
  </div>
</div>

━━ NEXT STEPS (2x2 card grid - required layout) ━━
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px;">
  [Repeat 4 times, each cell is a card:]
  <div class="next-step-card" style="border: 0.5px solid var(--iw-slate-100); border-radius: 12px; padding: 16px 16px 14px; background: var(--iw-off-white); break-inside: avoid; page-break-inside: avoid; min-height: 100px;">
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--iw-teal); color: var(--iw-white); font-size: 10pt; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,194,168,0.35);">[N]</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 10pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 6px; letter-spacing: 0.01em;">[Action Title]</div>
        <div style="font-size: 9pt; color: var(--iw-slate-500); line-height: 1.55;">[Supporting sentence]</div>
      </div>
    </div>
  </div>
</div>

CONTENT RULES:
1. Ground sections in the client's industry and WEBSITE INTAKE; avoid generic consulting filler.
2. Never use em dash (U+2014) or en dash (U+2013) in any visible copy; use commas, colons, or hyphen-minus (-) instead.
3. "Executive Summary": exactly 2 paragraphs. Paragraph 1 MUST state the deal tier using deal property "tier" from DATA when it is set (same spelling and casing as DATA). If "tier" is not set, use "Deal tier display" from DATA. Paragraph 2 describes what we are delivering using line item names from DATA and website intake only. Neutral tone. No dollar amounts.
4. "What You Told Us": cards MUST be grounded ONLY in WEBSITE INTAKE TO CLIENT (and the website-intake portions of FULL DEAL NOTES). Every card must map to concrete intake content (goals, pages, features, audience, design, etc.). Do not state client budget amounts, ranges, or "under $X" wording on these cards. Forbidden: generic consulting themes not written in intake. Minimum 2 cards, maximum 6.
5. "Detailed Scope of Work": ${lineItemsRules} When MANDATORY SCOPE TITLES lists numbered items, you MUST output one scope-card per item with that EXACT title string. Under "We will:", bullets must relate to that line item and intake, not unrelated platforms.
6. "Implementation Roadmap": 4 phase cards (Foundation, Core Build, Integration, Launch and Optimization). Each phase's bullets may ONLY reference (i) line item names from DATA, (ii) pages/features/goals explicitly named in WEBSITE INTAKE or FULL DEAL NOTES. Do not invent tools, vendors, or integrations not mentioned. Never list or imply live chat, AI chatbots, conversational AI, or similar messaging products as milestones or deliverables (IntraWeb does not include those in proposals).
7. "Expected Outcomes": 5-6 cards. Measurable where intake allows; otherwise restrained, neutral statements.
8. "Why IntraWeb": left column ties calmly to their situation. Right column: three neutral pills; do NOT use "Fast Implementation" or similar speed-first titles. Prefer "Phased delivery", "Integrated build", or "Structured communication".
9. "Next Steps": 4 steps. Step 1 = kickoff call within 48 hrs. Step 4 = system live in 8 weeks.
10. Do not fabricate facts. Any dollar figure in body copy must match INVESTMENT in DATA (quoted total, 40% upfront, remainder only). Never cite template tier monthly unless it appears as a line item.
11. Chat and messaging (mandatory): Do NOT promise, describe, or list live chat, AI chatbots, conversational AI assistants, chat widgets, or similar messaging products in any section (Detailed Scope bullets, Implementation Roadmap, Expected Outcomes, Executive Summary, Next Steps, or elsewhere). Website intake may list them as interests; omit them entirely from proposed deliverables. For lead capture or engagement, describe only accurate alternatives that match IntraWeb scope (for example contact forms, CRM routing, email automation, booking flows, reviews widgets) without implying chat interfaces.
12. Professional wording (mandatory): Every section visible to the client must avoid profanity, vulgar slang, slurs, and dismissive insults, including inside "What You Told Us" cards and "You said" lines on scope blocks. If intake expresses dislike of a competitor persona or industry stereotype, restate it calmly (for example they want an authentic, straightforward presence rather than a flashy or gimmicky wellness brand voice). Never echo crude labels from intake.`,

      userPrompt: `Generate output for this client. Narrative truth sources are ONLY: (A) website intake in the sections below, and (B) deal tier in DATA. Client facts must match DATA. Dollar amounts must match INVESTMENT in DATA only.

First, output the <<<PAIN_SUMMARY>>> ... <<<END_PAIN_SUMMARY>>> block exactly as specified in OUTPUT RULES, then output the inner HTML body (no other text before HTML).

Then output the inner HTML body sections in order using the design system components above:
1. Executive Summary: per CONTENT RULES (verbatim deal tier string first).
2. What You Told Us: per CONTENT RULES; ground every card in WEBSITE INTAKE or FULL DEAL NOTES text.
3. Detailed Scope of Work: follow MANDATORY SCOPE TITLES exactly when line items exist; "You said / We will" pattern tied to intake quotes.
4. Implementation Roadmap: per rule 6; no invented stack or timeline promises beyond week ranges given.
5. Expected Operational Outcomes: 3-column grid, 5-6 outcome cards. Neutral, intake-grounded.
6. Why IntraWeb: split block per CONTENT RULES (no speed-bravado titles).
7. Next Steps: 2x2 grid, 4 numbered steps with teal circle numbers.

DATA (dynamic - this run only):
${commercialContext}

LINE ITEMS (quoted components - scope and narrative must reflect each when present):
${lineItemsBlock}

WEBSITE INTAKE TO CLIENT (primary source for <<<PAIN_SUMMARY>>> intake sentences and for "What You Told Us" cards):
"""
${whatYouToldUsSource}
"""

FULL DEAL NOTES (deal_pain_points and related; use for grounding scope, roadmap, and cards when intake above is short):
"""
${fullContextNotes}
"""`,

      maxTokens: 8000,
    },
  },
];
