const d = $('Extract Deal Data').first().json;

const intakePainPoints =
  [d.rawPainPoints, d.painPointSummary, d.painPoints]
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)
    .join('\n\n') || '(None provided)';

const fmtMoney = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x);
};

const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsSubtotalCalc =
  Number(d.lineItemsSubtotal) || lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0);
const discClaude = Math.max(0, Number(d.totalDiscount) || 0);
const quotedFromLines =
  lineItemsSubtotalCalc > 0 ? Math.max(0, lineItemsSubtotalCalc - discClaude) : Number(d.dealAmount) || 0;
const isRecLine = (name) => {
  const n = String(name || '').toLowerCase();
  return /\bretainer\b/.test(n) || /\bmaintenance\b/.test(n) || /\bmonthly\b/.test(n);
};
const monthlyFromLines = lineItems
  .filter((li) => isRecLine(li.name))
  .reduce((s, li) => s + (Number(li.amount) || 0), 0);
const upfrontForShell =
  lineItemsSubtotalCalc > 0 ? Math.round(lineItemsSubtotalCalc * 0.33 * 100) / 100 : Number(d.upfrontDue) || 0;
const launchEst =
  Math.max(0, quotedFromLines - upfrontForShell) +
  (monthlyFromLines > 0 ? monthlyFromLines : Number(d.tierMonthly) || 0);

const lineItemsBlock = lineItems.length
  ? lineItems
      .map(
        (li, i) =>
          `  ${i + 1}. ${li.name || 'Item'} - ${fmtMoney(li.amount)}\n` +
          (li.description ? `     Notes: ${li.description}\n` : ''),
      )
      .join('')
  : '(No line items in payload - scope from tier and pain points only.)';

const lineItemsRules = lineItems.length
  ? 'When LINE ITEMS are present: treat each line item as a distinct sellable component (e.g. website vs automation). Include at least one scope block that maps to each line item by name, in addition to tying work to pain points. Min 2, max 4 blocks total.'
  : 'one scope block per major pain point. Min 2, max 4 blocks.';

const nz = (v, fallback = 'Not provided') => {
  const s = String(v ?? '').trim();
  return s || fallback;
};

const lineItemNames = lineItems.length
  ? lineItems.map((li) => (li.name || 'Item').trim()).filter(Boolean).join(', ')
  : 'none';

const commercialContext = [
  `Deal ID: ${nz(d.dealId)}`,
  `Client / deal name: ${nz(d.clientName)}`,
  `Company: ${nz(d.companyDisplay || d.company)}`,
  `Industry: ${nz(d.industryDisplay || d.industry)}`,
  `Primary contact: ${nz(d.contactName || d.contactFirstName)}`,
  `Contact email: ${nz(d.contactEmailDisplay || d.contactEmail)}`,
  `Contact phone: ${d.contactPhone ? String(d.contactPhone).trim() : 'Not provided'}`,
  '',
  'COMMERCIAL (aligned with proposal PDF shell - use only these numbers; do not invent totals):',
  `- HubSpot deal amount property (reference only; PDF quoted total follows line items when present): ${fmtMoney(d.dealAmount)}`,
  `- Line item count: ${lineItems.length} (${lineItemNames})`,
  `- Line items subtotal: ${fmtMoney(lineItemsSubtotalCalc)}`,
  `- PDF quoted total (subtotal minus deal-level discount when applicable): ${fmtMoney(quotedFromLines)}`,
  `- Total discount (deal-level, if any): ${fmtMoney(d.totalDiscount)}`,
  `- Tier label: ${nz(d.tierLabel)}`,
  `- Monthly recurring (retainer/maintenance from line items, else tier template): ${fmtMoney(monthlyFromLines > 0 ? monthlyFromLines : Number(d.tierMonthly) || 0)}`,
  `- Upfront (33% of line-item subtotal when line items exist, else tier upfront): ${fmtMoney(upfrontForShell)}`,
  `- Launch balance estimate (matches PDF shell): ${fmtMoney(launchEst)}`,
].join('\n');

return [
  {
    json: {
      systemPrompt: `You are writing a polished consulting proposal body for IntraWeb Technologies LLC.
We are the implementation partner - not a generic advisor. Tone: direct, credible, senior, specific.

OUTPUT RULES:
- First, output a pain-point summary block for the PDF cover page (plain text only inside the delimiters, no HTML tags in this block). Use exactly these lines in order, with no text before the opening delimiter:
<<<PAIN_SUMMARY>>>
Write 4-6 short sentences summarizing what the client is trying to fix, their goals, timeline, budget signals, and products or outcomes they named. Be specific to the DATA and PAIN POINTS. Do not invent facts. Do not use em dashes or en dashes (Unicode U+2013/U+2014); use commas or hyphen-minus only.
<<<END_PAIN_SUMMARY>>>
- After that block, return ONLY the inner HTML body content. No DOCTYPE, no <html>, no <head>, no <body> tags.
- No markdown. No backticks. No prose outside of HTML tags.
- The PDF shell already renders header, client snapshot, a short intake or pain summary, investment table, and footer - do NOT repeat those.
- Implementation Roadmap MUST be a 2x2 CSS grid (display:grid; grid-template-columns:1fr 1fr; gap:12px) - never a single-column stack.
- Expected Operational Outcomes MUST be a 3-column CSS grid (grid-template-columns:1fr 1fr 1fr; gap:10px) on wide layouts; if you must wrap, still use grid with two columns minimum - not one card per full row.
- Next Steps MUST use a 2x2 grid of styled cards (see pattern below) - not a vertical list.
- For every inline style color, border-color, and background, use ONLY CSS variables from this set (never raw hex): var(--iw-slate-950) through var(--iw-slate-50), var(--iw-teal), var(--iw-teal-light), var(--iw-teal-dim), var(--iw-teal-ghost), var(--iw-orange), var(--iw-orange-dim), var(--iw-orange-ghost), var(--iw-white), var(--iw-off-white). Example: color: var(--iw-slate-700);
- Prefer semantic <ul>/<li> for bullet lists inside scope blocks when listing deliverables or milestones.
- On every card, scope block, phase block, outcome card, and each direct child of a CSS grid wrapper, include both break-inside: avoid and page-break-inside: avoid in the inline style (Chromium PDF print follows break-inside more reliably).

DESIGN SYSTEM - use these patterns (colors via variables only):

━━ SECTION TITLE ━━
<div style="font-size: 10pt; font-weight: 700; color: var(--iw-teal-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 10px;">Section Title</div>

━━ PROSE PARAGRAPHS ━━
<p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">Text here.</p>

━━ PAIN POINT CARD (use in "What You Told Us") ━━
<div style="border: 0.5px solid var(--iw-slate-100); margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-50); padding: 8px 14px; border-bottom: 0.5px solid var(--iw-slate-100); font-size: 9pt; font-weight: 700; font-style: italic; color: var(--iw-slate-800);">[Pain Point Label]</div>
  <div style="padding: 10px 14px; font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[2-3 sentences: operational impact and what we are solving]</div>
</div>

━━ SCOPE BLOCK (one per major deliverable, in "Detailed Scope of Work") ━━
<div style="margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-950); padding: 10px 14px;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-white);">[Deliverable Name]</div>
    <div style="font-size: 8.5pt; color: var(--iw-teal-light); margin-top: 3px; font-style: italic;">You said: [verbatim or close paraphrase of pain point, no em or en dashes]</div>
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
  <div style="border: 0.5px solid var(--iw-slate-100); break-inside: avoid; page-break-inside: avoid;">
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
  <div style="border: 0.5px solid var(--iw-slate-100); border-top: 2px solid var(--iw-teal); padding: 12px 14px; break-inside: avoid; page-break-inside: avoid;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 5px;">[Outcome Title]</div>
    <div style="font-size: 9pt; color: var(--iw-slate-500); line-height: 1.5;">[1-2 sentences, measurable, industry-specific; no em or en dashes]</div>
  </div>
</div>

━━ WHY INTRAWEB BLOCK (title must stay with the teal panel; avoid orphan headings across pages) ━━
<div style="break-inside: avoid-page; page-break-inside: avoid;">
  <div style="font-size: 10pt; font-weight: 700; color: var(--iw-teal-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 10px;">Why IntraWeb</div>
  <div style="background: var(--iw-teal-ghost); border: 0.5px solid var(--iw-slate-100); padding: 20px 24px; margin-bottom: 4px; break-inside: avoid; page-break-inside: avoid;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">[Paragraph 1: specific to their industry and pain points. No generic claims. No em or en dashes.]</p>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[Paragraph 2: execution focus, delivery speed, real results from day one. No em or en dashes.]</p>
    </div>
    <div>
      [Repeat 3 times:]
      <div style="background: var(--iw-white); border: 0.5px solid var(--iw-slate-100); padding: 10px 14px; margin-bottom: 8px;">
        <div style="font-size: 9pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 3px;">[Differentiator Title]</div>
        <div style="font-size: 8.5pt; color: var(--iw-slate-500);">[One sentence]</div>
      </div>
    </div>
  </div>
  </div>
</div>

━━ NEXT STEPS (2x2 card grid - required layout) ━━
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px;">
  [Repeat 4 times, each cell is a card:]
  <div style="border: 0.5px solid var(--iw-slate-100); border-radius: 12px; padding: 16px 16px 14px; background: var(--iw-off-white); break-inside: avoid; page-break-inside: avoid; min-height: 100px;">
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
1. Every section must directly reference the client's industry and pain points - no generic filler.
2. Never use em dash (U+2014) or en dash (U+2013) in any visible copy; use commas, colons, or hyphen-minus (-) instead.
3. "What You Told Us": one pain point card per distinct pain point from the payload.
4. "Detailed Scope of Work": ${lineItemsRules}
5. "Implementation Roadmap": 4 phase cards: Foundation, Core Build, Integration, Launch and Optimization.
6. "Expected Outcomes": 5-6 cards. Measurable. Specific to their industry. No vague claims.
7. "Why IntraWeb": left column prose references their exact situation. Right column 3 differentiator pills. Keep the section title immediately above the teal panel in one print block.
8. "Next Steps": 4 steps. Step 1 = kickoff call within 48 hrs. Step 4 = system live in 8 weeks.
9. Do not fabricate facts not in the payload. If a detail is missing, write around it naturally.`,

      userPrompt: `Generate output for this client. All client facts and commercial figures MUST come from the DATA block below - never substitute placeholder client names or generic dollar amounts.

First, output the <<<PAIN_SUMMARY>>> ... <<<END_PAIN_SUMMARY>>> block exactly as specified in OUTPUT RULES (plain text inside the delimiters, then nothing until the HTML begins).

Then output the inner HTML body sections in order using the design system components above:
1. Executive Summary: 2 prose paragraphs. Reference their specific operational challenges. If LINE ITEMS exist, summarize the bundle (e.g. website + automation) without inventing numbers not in the payload.
2. What You Told Us: one pain point card per pain point.
3. Detailed Scope of Work: when LINE ITEMS exist, align scope blocks with each line item by name and tie to pain points; otherwise one block per major pain point. "You said / We will" pattern. Use lists where appropriate.
4. Implementation Roadmap: 2x2 grid, 4 phase cards, Weeks 1-2 through 7-8.
5. Expected Operational Outcomes: 3-column grid, 5-6 outcome cards. Measurable and industry-specific.
6. Why IntraWeb: split block: left prose (2 paragraphs, industry-specific), right 3 differentiator pills. Follow the WHY INTRAWEB BLOCK pattern so the heading stays with the panel.
7. Next Steps: 2x2 grid, 4 numbered steps with teal circle numbers.

DATA (dynamic - this run only):
${commercialContext}

LINE ITEMS (quoted components - scope and narrative must reflect each when present):
${lineItemsBlock}

PAIN POINTS - address every one explicitly (split into distinct cards when multiple themes appear):
"""
${intakePainPoints}
"""`,

      maxTokens: 8000,
    },
  },
];
