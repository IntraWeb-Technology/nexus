const claudeResult = $('Parse Claude Response').first().json;
const d = $('Extract Deal Data').first().json;
const config = d.config || {};
const branding = config.branding || {};
const owner = config.owner || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'John Schibelli';
const calendarLink = owner.calendarLink || '';
const bodyContent = (claudeResult.data ? claudeResult.data.text : claudeResult.html || '').trim();
const painSummaryForShell = String(claudeResult.painSummaryForShell || '').trim();
const clientName = d.clientName || 'Client';
const proposalDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const docId = d.dealId ? `DEAL-${String(d.dealId).slice(0, 12)}` : `PROP-${Date.now().toString(36).toUpperCase()}`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const noEmDash = (value) =>
  String(value ?? '')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/—/g, '-');

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

const logoHtml = (() => {
  const b64 = branding.logoPdfBase64 || branding.logoDarkBase64;
  const url = branding.logoUrlDark || branding.logoUrl;
  if (b64 && String(b64).trim()) {
    const src = String(b64).startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
    return `<img class="doc-header__logo" src="${src}" alt="IntraWeb" height="36" />`;
  }
  if (url && String(url).trim()) {
    return `<img class="doc-header__logo" src="${escapeHtml(url)}" alt="IntraWeb" height="36" />`;
  }
  return `<div class="doc-header__wordmark" aria-hidden="true">IntraWeb</div>`;
})();

/** Short themes for PDF - no raw intake dump, JSON, or PII. */
const summarizeIntakeForPdf = () => {
  const summary = String(d.painPointSummary || '').trim();
  if (summary) {
    const parts = summary
      .split(/[,;]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) return noEmDash(parts.map((p) => `• ${p}`).join('\n'));
  }
  let raw = String(d.rawPainPoints || d.painPoints || '').trim();
  if (!raw) return 'No intake themes were captured for this opportunity.';
  raw = raw.split(/\n-{3,}\n/)[0].trim();
  raw = raw.replace(/Website intake \(JSON\):[\s\S]*?(?=\n-{3,}|\n===|$)/gi, '');
  raw = raw.replace(/Website intake \(structured fields\):[\s\S]*$/i, '');
  const lines = raw.split('\n').filter((ln) => {
    const t = ln.trim();
    if (!t) return false;
    if (/^(email|phone|name|firstname|lastname|business|location)\s*:/i.test(t)) return false;
    if (/^===\s*Website intake/i.test(t)) return false;
    return true;
  });
  raw = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (raw.length > 2400) raw = `${raw.slice(0, 2400).trim()}…`;
  return noEmDash(raw || 'No intake themes were captured for this opportunity.');
};

const intakeThemesText = summarizeIntakeForPdf();
const intakeThemesHtml = `<p class="quote quote--themes">${escapeHtml(intakeThemesText).replace(/\n/g, '<br/>')}</p>`;

const contactDisplay = d.contactName || d.contactFirstName || '';
const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsSubtotal =
  Number(d.lineItemsSubtotal) ||
  lineItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);
const discPdf = Math.max(0, Number(d.totalDiscount) || 0);
const dealAmtPdf = Number(d.dealAmount) || 0;
const tierAmtPdf = Number(d.tierAmount) || 0;

/** When line items exist, quoted total follows the table (subtotal − discounts), not a mismatched HubSpot deal amount. */
const finalQuotedPdf =
  lineItemsSubtotal > 0
    ? Math.max(0, lineItemsSubtotal - discPdf)
    : dealAmtPdf > 0
      ? dealAmtPdf
      : tierAmtPdf;

const isRecurringLineItem = (name) => {
  const n = String(name || '').toLowerCase();
  return /\bretainer\b/.test(n) || /\bmaintenance\b/.test(n) || /\bmonthly\b/.test(n);
};

const monthlyFromLineItems = lineItems
  .filter((li) => isRecurringLineItem(li.name))
  .reduce((s, li) => s + (Number(li.amount) || 0), 0);

const displayMonthlyRecurring =
  monthlyFromLineItems > 0 ? monthlyFromLineItems : Number(d.tierMonthly) || 0;

const upfrontPdf =
  lineItemsSubtotal > 0 ? Math.round(lineItemsSubtotal * 0.33 * 100) / 100 : Number(d.upfrontDue) || 0;

const afterUpfront = Math.max(0, finalQuotedPdf - upfrontPdf);
const launchBalancePdf = afterUpfront + displayMonthlyRecurring;

const tierMonthlyText = formatCurrency(displayMonthlyRecurring);
const upfrontDueText = formatCurrency(upfrontPdf);
const launchBalanceText = formatCurrency(launchBalancePdf);

const snapshotCompanyDisplay = noEmDash(String(d.companyDisplay || '').trim());
const snapshotCompanyCell = snapshotCompanyDisplay || 'Not specified';

const heroDisplayName = noEmDash(clientName || snapshotCompanyDisplay);

const snapshotEmail = noEmDash(
  String(d.contactEmailDisplay || d.contactEmail || '').trim(),
);
const snapshotIndustry = noEmDash(
  String(d.industryDisplay || d.industry || '').trim(),
);
const snapshotWebsite = noEmDash(String(d.website || '').trim());
const snapshotAddress = noEmDash(String(d.address || '').trim());

const monthlyRowLabel =
  monthlyFromLineItems > 0
    ? 'Monthly recurring (retainer / maintenance from line items)'
    : 'Monthly retainer (tier template)';

const lineItemsRowsHtml = (() => {
  const rows = [];
  if (lineItems.length) {
    for (const li of lineItems) {
      rows.push(
        `<tr><td>${escapeHtml(li.name || 'Item')}</td><td class="num">${escapeHtml(formatCurrency(li.amount))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__subtotal"><td>Subtotal (line items)</td><td class="num">${escapeHtml(formatCurrency(lineItemsSubtotal))}</td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td>Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf))}</strong></td></tr>`,
    );
  } else {
    rows.push(
      `<tr><td>Tier / package (${escapeHtml(d.tierLabel || d.tier || '')})</td><td class="num">${escapeHtml(formatCurrency(d.tierAmount))}</td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td>Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf || d.tierAmount))}</strong></td></tr>`,
    );
  }
  return rows.join('');
})();

const calendarHtml = calendarLink
  ? `<p class="doc-body__cta"><a class="cta-pill" href="${escapeHtml(calendarLink)}">Book approval call</a></p>`
  : '';

const safeBodyContent =
  bodyContent ||
  '<h2 class="doc-prose-h2">Executive Summary</h2><p class="body-text">Proposal content could not be generated.</p>';

const bodyInner = (() => {
  if (!safeBodyContent) return '';
  if (/^\s*</.test(safeBodyContent)) return safeBodyContent;
  return safeBodyContent
    .split(/\n\n+/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      return `<p class="body-text">${escapeHtml(t).replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
})();

const painShellPlain = noEmDash(
  painSummaryForShell.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
);
const usePainShell = painShellPlain.replace(/\s+/g, ' ').length > 48;
const painShellSection = usePainShell
  ? `<section class="doc-section doc-section--pain-shell">
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>What we heard</h2>
        <p class="body-text pain-shell">${escapeHtml(painShellPlain).replace(/\n/g, '<br/>')}</p>
      </section>`
  : '';
const intakeThemesSection = usePainShell
  ? ''
  : `<section class="doc-section doc-section--intake-themes">
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Themes from intake</h2>
        <div class="callout callout--orange">
          ${intakeThemesHtml}
        </div>
      </section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposal - ${escapeHtml(clientName)} - ${escapeHtml(companyName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
  <style>
    :root {
      --iw-slate-950: #0d1117;
      --iw-slate-900: #141b26;
      --iw-slate-800: #1c2636;
      --iw-slate-700: #253347;
      --iw-slate-600: #344659;
      --iw-slate-500: #4a6075;
      --iw-slate-400: #6b8399;
      --iw-slate-300: #96aebe;
      --iw-slate-200: #c4d1da;
      --iw-slate-100: #e4eaef;
      --iw-slate-50: #f2f5f8;
      --iw-teal: #00c2a8;
      --iw-teal-light: #00dfc8;
      --iw-teal-dim: #007a6a;
      --iw-teal-ghost: #e0f8f5;
      --iw-orange: #f26419;
      --iw-orange-dim: #c04e0e;
      --iw-orange-ghost: #fef0e8;
      --iw-white: #ffffff;
      --iw-off-white: #f8fafb;
      --iw-print-footer-block: 0.55in;
    }
    @page {
      size: 8.5in 11in;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html,
    body {
      margin: 0;
      padding: 0;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    .iw-page {
      width: 100%;
      max-width: none;
      min-height: 10in;
      margin: 0;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
    }
    @media print {
      .iw-page {
        width: 100%;
        min-height: 0;
        margin: 0;
      }
    }
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 0.45in;
      background: var(--iw-slate-950);
      border-bottom: 3px solid var(--iw-teal);
      color: var(--iw-white);
    }
    .doc-header__logo {
      height: 36px;
      width: auto;
      display: block;
    }
    .doc-header__wordmark {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--iw-white);
    }
    .doc-header__doc-type {
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--iw-slate-300);
    }
    .doc-header__doc-id {
      font-size: 10pt;
      font-weight: 600;
      color: var(--iw-white);
      margin-top: 4px;
      text-align: right;
    }
    .doc-hero {
      background: var(--iw-slate-900);
      padding: 28px 0.45in 26px;
      color: var(--iw-white);
    }
    .doc-hero__label {
      display: inline-block;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--iw-orange);
      margin-bottom: 10px;
    }
    .doc-hero__label::before {
      content: '';
      margin-right: 0;
      color: var(--iw-orange);
    }
    .doc-hero__title {
      margin: 0 0 10px;
      font-size: 24pt;
      font-weight: 700;
      line-height: 1.15;
      color: var(--iw-white);
    }
    .doc-hero__subtitle {
      margin: 0;
      max-width: none;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--iw-slate-300);
    }
    .doc-meta-bar {
      display: flex;
      flex-wrap: wrap;
      padding: 0 0.45in;
      background: var(--iw-slate-800);
      color: var(--iw-slate-100);
      font-size: 9.5pt;
    }
    .doc-meta-bar__item {
      flex: 1 1 0;
      min-width: 140px;
      padding: 12px 16px;
      border-right: 1px solid var(--iw-slate-600);
    }
    .doc-meta-bar__item:last-child {
      border-right: none;
    }
    .doc-meta-bar__k {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--iw-slate-400);
      margin-bottom: 4px;
    }
    .doc-meta-bar__v {
      font-weight: 600;
      color: var(--iw-white);
      word-break: break-word;
    }
    .doc-body {
      background: var(--iw-white);
      padding: 24px 0.45in 32px;
    }
    @media print {
      .doc-body {
        padding-bottom: calc(12pt + var(--iw-print-footer-block));
      }
    }
    .doc-body > * + * {
      margin-top: 32px;
    }
    .doc-section__title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12pt;
      font-weight: 700;
      margin: 0 0 14px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid var(--iw-slate-100);
      color: var(--iw-slate-800);
    }
    .doc-section--pain-shell .pain-shell {
      font-size: 10pt;
      line-height: 1.65;
      color: var(--iw-slate-800);
      margin: 0;
    }
    .doc-section__accent {
      width: 4px;
      height: 18px;
      background: var(--iw-teal);
      flex-shrink: 0;
    }
    .kv-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 20px;
    }
    .kv-grid--3col {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .kv-grid .kv-k {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--iw-slate-400);
      margin-bottom: 4px;
    }
    .kv-grid .kv-v {
      font-size: 10pt;
      color: var(--iw-slate-800);
      font-weight: 600;
      word-break: break-word;
    }
    .line-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .line-table thead th {
      background: var(--iw-slate-950);
      color: var(--iw-white);
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      font-size: 8.5pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .line-table thead th:last-child {
      text-align: right;
    }
    .line-table tbody tr:nth-child(odd) {
      background: var(--iw-off-white);
    }
    .line-table tbody tr:nth-child(even) {
      background: var(--iw-white);
    }
    .line-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--iw-slate-100);
      vertical-align: top;
    }
    .line-table td.num {
      text-align: right;
      font-weight: 700;
      color: var(--iw-slate-800);
      white-space: nowrap;
    }
    .line-table tbody tr.line-table__subtotal td {
      background: var(--iw-off-white);
      font-weight: 700;
      border-bottom: 1px solid var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__discount td {
      color: var(--iw-orange-dim);
      font-weight: 700;
      background: var(--iw-orange-ghost);
    }
    .line-table tbody tr.line-table__quoted td {
      background: var(--iw-slate-50);
      font-weight: 800;
      font-size: 10.5pt;
      border-bottom: 1px solid var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__schedule td {
      font-size: 8.5pt;
      font-weight: 600;
      color: var(--iw-slate-500);
      padding-top: 14px;
      border-bottom: 1px dashed var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__total td {
      background: var(--iw-teal-ghost);
      border-bottom: none;
      color: var(--iw-teal-dim);
      font-weight: 800;
      font-size: 11pt;
    }
    .line-table .muted {
      color: var(--iw-slate-500);
      font-weight: 500;
    }
    .callout {
      border-left: 4px solid var(--iw-teal);
      background: var(--iw-teal-ghost);
      padding: 16px 18px;
      border-radius: 0 10px 10px 0;
    }
    .callout--orange {
      border-left-color: var(--iw-orange);
      background: var(--iw-orange-ghost);
    }
    .callout--slate {
      border-left-color: var(--iw-slate-500);
      background: var(--iw-slate-50);
    }
    .callout .quote {
      margin: 0 0 10px;
      font-size: 11pt;
      line-height: 1.65;
      color: var(--iw-slate-700);
      white-space: pre-wrap;
    }
    .callout .quote--themes {
      white-space: normal;
      font-size: 10pt;
      line-height: 1.65;
      max-height: none;
    }
    .body-text {
      font-size: 10pt;
      line-height: 1.75;
      color: var(--iw-slate-700);
      margin: 0 0 10px;
    }
    .proposal-body .body-text,
    .proposal-body p {
      font-size: 10pt;
      line-height: 1.75;
      color: var(--iw-slate-700);
    }
    .proposal-body h2,
    .doc-prose-h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12pt;
      font-weight: 700;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid var(--iw-slate-100);
      color: var(--iw-slate-800);
      break-after: avoid;
    }
    .proposal-body h2::before,
    .doc-prose-h2::before {
      content: '';
      width: 4px;
      height: 18px;
      background: var(--iw-teal);
      flex-shrink: 0;
    }
    .proposal-body h3 {
      font-size: 11pt;
      font-weight: 700;
      margin: 18px 0 8px;
      color: var(--iw-slate-800);
    }
    .proposal-body ul,
    .proposal-body ol {
      margin: 0 0 12px;
      padding-left: 20px;
      color: var(--iw-slate-700);
      font-size: 10pt;
      line-height: 1.7;
    }
    .divider {
      height: 1px;
      background: var(--iw-slate-100);
      margin: 8px 0 0;
      border: none;
    }
    .doc-body__cta {
      margin: 8px 0 0;
    }
    .cta-pill {
      display: inline-block;
      text-decoration: none;
      background: var(--iw-teal);
      color: var(--iw-white);
      font-weight: 700;
      font-size: 10pt;
      padding: 11px 20px;
      border-radius: 999px;
    }
    .cta-pill:hover {
      background: var(--iw-teal-dim);
    }
    .doc-footer {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      align-items: center;
      gap: 12px;
      padding: 12px 0.45in;
      background: var(--iw-slate-950);
      color: var(--iw-slate-300);
      font-size: 8pt;
    }
    @media print {
      .doc-footer {
        padding-left: 0.45in;
        padding-right: 0.45in;
      }
    }
    .doc-footer__brand {
      font-weight: 700;
      color: var(--iw-teal-light);
      letter-spacing: 0.04em;
    }
    .doc-footer__conf {
      text-align: center;
      color: var(--iw-slate-400);
      line-height: 1.4;
    }
    .doc-footer__page {
      text-align: right;
      color: var(--iw-slate-300);
      font-weight: 600;
    }
    .fine-print {
      font-size: 9pt;
      color: var(--iw-slate-500);
      line-height: 1.5;
      margin-top: 8px;
    }
    @media print {
      html,
      body {
        height: auto;
      }
      main.doc-body > section:not(.proposal-body) {
        break-inside: auto;
        page-break-inside: auto;
      }
      .doc-body > section:not(.proposal-body) > .doc-section__title {
        break-after: avoid-page;
        page-break-after: avoid;
      }
      .doc-hero {
        break-after: avoid-page;
        page-break-after: avoid;
      }
      .doc-section__title {
        break-after: avoid-page;
        page-break-after: avoid;
        break-inside: avoid;
      }
      .kv-grid {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .line-table thead {
        display: table-header-group;
      }
      .line-table tbody tr {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .proposal-body h2,
      .doc-prose-h2 {
        break-after: avoid-page;
        page-break-after: avoid;
        break-inside: avoid;
      }
      .proposal-body div[style*="display:grid"] > div,
      .proposal-body div[style*="display: grid"] > div {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="iw-page">
    <header class="doc-header">
      <div class="doc-header__left">${logoHtml}</div>
      <div>
        <div class="doc-header__doc-type">Project Proposal</div>
        <div class="doc-header__doc-id">${escapeHtml(docId)}</div>
      </div>
    </header>

    <section class="doc-hero">
      <div class="doc-hero__label">Project Proposal</div>
      <h1 class="doc-hero__title">${escapeHtml(heroDisplayName)}</h1>
      <p class="doc-hero__subtitle">Delivery-focused implementation scope, commercial summary, and next steps, aligned to the operational context captured for this opportunity.</p>
    </section>

    <div class="doc-meta-bar">
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Prepared for</div>
        <div class="doc-meta-bar__v">${escapeHtml(clientName)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Prepared on</div>
        <div class="doc-meta-bar__v">${escapeHtml(proposalDate)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Account manager</div>
        <div class="doc-meta-bar__v">${escapeHtml(ownerName)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Valid through</div>
        <div class="doc-meta-bar__v">${escapeHtml(validThrough)}</div>
      </div>
    </div>

    <main class="doc-body">
      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Client snapshot</h2>
        <div class="kv-grid kv-grid--3col">
          <div><div class="kv-k">Client</div><div class="kv-v">${escapeHtml(clientName)}</div></div>
          <div><div class="kv-k">Company</div><div class="kv-v">${escapeHtml(snapshotCompanyCell)}</div></div>
          <div><div class="kv-k">Primary contact</div><div class="kv-v">${escapeHtml(contactDisplay)}</div></div>
          <div><div class="kv-k">Email</div><div class="kv-v">${escapeHtml(snapshotEmail || 'Not specified')}</div></div>
          <div><div class="kv-k">Phone</div><div class="kv-v">${escapeHtml(noEmDash(String(d.contactPhone || '').trim()) || 'Not specified')}</div></div>
          <div><div class="kv-k">Industry</div><div class="kv-v">${escapeHtml(snapshotIndustry || 'Not specified')}</div></div>
          <div><div class="kv-k">Website</div><div class="kv-v">${escapeHtml(snapshotWebsite || 'Not specified')}</div></div>
          <div style="grid-column: span 2"><div class="kv-k">Address</div><div class="kv-v">${escapeHtml(snapshotAddress || 'Not specified')}</div></div>
        </div>
      </section>

      ${painShellSection}
      ${intakeThemesSection}

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Investment summary</h2>
        <table class="line-table">
          <thead><tr><th>Item</th><th>Amount</th></tr></thead>
          <tbody>
            ${lineItemsRowsHtml}
            <tr class="line-table__schedule"><td colspan="2">Payment timing (estimate; final cadence on invoice)</td></tr>
            <tr><td>${escapeHtml(monthlyRowLabel)}</td><td class="num">${escapeHtml(tierMonthlyText)}</td></tr>
            <tr><td>${escapeHtml(lineItemsSubtotal > 0 ? 'Upfront due (33% of line-item subtotal)' : 'Upfront due')}</td><td class="num">${escapeHtml(upfrontDueText)}</td></tr>
            <tr class="line-table__total"><td>Launch balance (estimate)</td><td class="num">${escapeHtml(launchBalanceText)}</td></tr>
          </tbody>
        </table>
        <p class="fine-print">Launch balance estimate = quoted total minus upfront plus first month of recurring (retainer/maintenance from line items when present, otherwise tier monthly). Final amounts on invoice.</p>
      </section>

      <section class="proposal-body">
        ${bodyInner}
        <hr class="divider" />
        <p class="body-text" style="margin-bottom: 4px"><strong>${escapeHtml(companyName)}</strong>${ownerEmail ? ` · ${escapeHtml(ownerEmail)}` : ''}${ownerPhone ? ` · ${escapeHtml(ownerPhone)}` : ''}</p>
        ${calendarHtml}
      </section>
    </main>

    <footer class="doc-footer">
      <div class="doc-footer__brand">IntraWeb</div>
      <div class="doc-footer__conf">Confidential - prepared for ${escapeHtml(clientName)}. Distribution outside the parties requires written consent.</div>
      <div class="doc-footer__page">Page 1</div>
    </footer>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb - ${d.clientName} - Proposal.pdf` } }];
