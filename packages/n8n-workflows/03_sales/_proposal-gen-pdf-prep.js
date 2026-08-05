/**
 * Proposal HTML for SYS 03 PDF generation. Printed via html2pdf.fly.dev (Puppeteer).
 * Server-side PDF code should use zero Puppeteer margins + preferCSSPageSize, emulateMediaType('print'),
 * setContent(html, { waitUntil: 'networkidle0' }), await page.evaluateHandle(() => document.fonts.ready).
 */
const claudeResult = $('Parse Claude Response').first().json;
const d = $('Extract Deal Data').first().json;
const config = d.config || {};
const branding = config.branding || {};
/** Set config.pdfDebugPrintLayout true in global CONFIG to outline sections/cards/tables in the PDF. */
const pdfDebugLayout = Boolean(
  config.pdfDebugPrintLayout === true ||
    config.pdfDebugPrintLayout === 'true' ||
    d.pdfDebugPrintLayout === true ||
    d.pdfDebugPrintLayout === 'true',
);
const htmlRootClass = pdfDebugLayout ? ' class="debug-print-layout"' : '';
const owner = config.owner || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'John Schibelli';
const calendarLink = owner.calendarLink || '';
const bodyContent = (claudeResult.data ? claudeResult.data.text : claudeResult.html || '').trim();
const painSummaryForShell = String(claudeResult.painSummaryForShell || '').trim();
const investmentSummaryForShell = String(claudeResult.investmentSummaryForShell || '').trim();
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

/** Public lockup; PDF renderer must fetch HTTPS (html2pdf.fly.dev). Prefer CONFIG branding.logoPdfBase64 when set. */
const DEFAULT_PROPOSAL_LOGO_URL = 'https://www.intrawebtech.com/IW-logo-q2.png';

const logoHtml = (() => {
  const b64 = branding.logoPdfBase64 || branding.logoDarkBase64;
  if (b64 && String(b64).trim()) {
    const src = String(b64).startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
    return `<img class="doc-header__logo" src="${src}" alt="IntraWeb." height="36" />`;
  }
  let url = String(branding.logoUrlDark || branding.logoUrl || '').trim() || DEFAULT_PROPOSAL_LOGO_URL;
  // CONFIG often still points at old /branding/ assets that 404 or fail in headless PDF fetch.
  if (
    url.includes('/branding/intraweb-logo') ||
    url.includes('intraweb-logo-light.png') ||
    url.includes('intraweb-logo-black')
  ) {
    url = DEFAULT_PROPOSAL_LOGO_URL;
  }
  return `<img class="doc-header__logo" src="${escapeHtml(url)}" alt="IntraWeb." height="36" width="160" />`;
})();

const stripIntakeJsonTails = (text) => {
  let s = String(text || '');
  for (const re of [
    /\nWebsite intake \(JSON\):[\s\S]*$/i,
    /\nWebsite intake \(structured fields\):[\s\S]*$/i,
  ]) {
    s = s.replace(re, '');
  }
  return s.trim();
};

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

const upfrontPdf = Math.round(finalQuotedPdf * 0.4 * 100) / 100;
const remainingBalancePdf = Math.max(0, finalQuotedPdf - upfrontPdf);
const upfrontDueText = formatCurrency(upfrontPdf);
const remainingBalanceText = formatCurrency(remainingBalancePdf);

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

/** Defensive: lead-in should never echo table amounts if Claude includes them. */
const investmentLeadInPlain = (() => {
  let t = noEmDash(investmentSummaryForShell);
  t = t.replace(/\$\s*[\d,]+(?:\.\d{1,2})?\b/g, '').replace(/\b(?:USD|usd)\b/g, '');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t;
})();

const dealTierFallback = String(
  d.dealTierHubspot || d.hubspotTierRaw || d.tierLabel || d.tier || '',
).trim();

const lineItemsRowsHtml = (() => {
  const colSpan2 = 2;
  const rows = [];
  if (lineItems.length) {
    for (const li of lineItems) {
      const itemTier = String(
        li.tier || d.dealTierHubspot || d.hubspotTierRaw || d.tierLabel || '',
      ).trim();
      const desc = String(li.description || '').trim();
      const itemBlock = [
        `<strong>${escapeHtml(li.name || 'Item')}</strong>`,
        desc
          ? `<div class="muted" style="margin-top: 4px; line-height: 1.45;">${escapeHtml(desc).replace(/\n/g, '<br/>')}</div>`
          : '',
      ].join('');
      const tierCell = itemTier
        ? escapeHtml(itemTier)
        : '<span class="muted">&nbsp;</span>';
      rows.push(
        `<tr><td>${itemBlock}</td><td class="line-table__tier">${tierCell}</td><td class="num">${escapeHtml(formatCurrency(li.amount))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__subtotal"><td colspan="${colSpan2}">Subtotal (line items)</td><td class="num">${escapeHtml(formatCurrency(lineItemsSubtotal))}</td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td colspan="${colSpan2}">Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td colspan="${colSpan2}"><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf))}</strong></td></tr>`,
    );
  } else {
    const tierLabel = dealTierFallback;
    rows.push(
      `<tr><td class="muted">${escapeHtml(tierLabel ? 'Scope reflects deal tier' : 'No line items found')}</td><td class="line-table__tier">${escapeHtml(tierLabel || '—')}</td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf || d.tierAmount))}</strong></td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td colspan="${colSpan2}">Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td colspan="${colSpan2}"><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf || d.tierAmount))}</strong></td></tr>`,
    );
  }
  return rows.join('');
})();

const investmentNarrativeHtml = investmentLeadInPlain
  ? `<p class="investment-narrative">${escapeHtml(investmentLeadInPlain).replace(/\n/g, '<br/>')}</p>`
  : lineItems.length
    ? '<p class="investment-narrative muted">The line items below reflect the proposed scope. Amounts and tier come from the deal record in HubSpot.</p>'
    : '<p class="investment-narrative muted">Quoted amount reflects the deal tier in HubSpot when no line item rows are present on the deal.</p>';

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

/**
 * Post-process Claude HTML so Chromium print gets predictable fragmentation without trusting class names.
 * - Strips inline display:grid/flex and clipping max-height that fight @media print overrides.
 * - Adds pdf-* classes for headings, tables, lists, blockquotes, card-like divs.
 * - Wraps each top-level h2 block in <section class="pdf-section"> so headings stay with following content.
 */
const normalizeProposalBodyHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  let s = html.trim();
  if (!s) return '';

  s = s.replace(/\sstyle="([^"]*)"/gi, (_full, inner) => {
    let x = String(inner)
      .replace(/display\s*:\s*(?:grid|flex|inline-flex)[^;]*;?/gi, '')
      .replace(/max-height\s*:\s*[^;]+;?/gi, '')
      .replace(/min-height\s*:\s*0[^;]*;?/gi, '')
      .replace(/writing-mode\s*:\s*[^;]+;?/gi, '')
      .replace(/text-orientation\s*:\s*[^;]+;?/gi, '')
      .replace(/font-family\s*:\s*[^;]+;?/gi, '')
      .replace(/letter-spacing\s*:\s*[^;]+;?/gi, '')
      .replace(/font-feature-settings\s*:\s*[^;]+;?/gi, '')
      .replace(/font-variant(?:-[a-z-]+)?\s*:\s*[^;]+;?/gi, '')
      .replace(/align-items\s*:\s*[^;]+;?/gi, '')
      .replace(/justify-content\s*:\s*[^;]+;?/gi, '')
      .replace(/\bgap\s*:\s*[^;]+;?/gi, '')
      .replace(/overflow\s*:\s*hidden[^;]*;?/gi, '')
      .replace(/;\s*;/g, ';')
      .trim();
    if (!x.replace(/[;\s]/g, '')) return '';
    return ` style="${x.replace(/^;+|;\s*$/g, '')}"`;
  });

  s = s.replace(/<h2([^>]*)>/gi, (full, attrs) => {
    if (/\bpdf-heading\b/.test(attrs)) return full;
    const cm = String(attrs).match(/\bclass\s*=\s*["']([^"']*)["']/i);
    if (cm) {
      const merged = `${cm[1]} pdf-heading`.trim();
      return `<h2${String(attrs).replace(/\bclass\s*=\s*["'][^"']*["']/i, `class="${merged}"`)}>`;
    }
    return `<h2 class="pdf-heading"${attrs}>`;
  });

  s = s.replace(/<h3([^>]*)>/gi, (full, attrs) => {
    if (/\bpdf-heading--sub\b/.test(attrs)) return full;
    const cm = String(attrs).match(/\bclass\s*=\s*["']([^"']*)["']/i);
    if (cm) {
      const merged = `${cm[1]} pdf-heading pdf-heading--sub`.trim();
      return `<h3${String(attrs).replace(/\bclass\s*=\s*["'][^"']*["']/i, `class="${merged}"`)}>`;
    }
    return `<h3 class="pdf-heading pdf-heading--sub"${attrs}>`;
  });

  s = s.replace(/<table(\s[^>]*)?>/gi, (full, attrs = '') => {
    if (/\bpdf-table\b/.test(full)) return full;
    const a = attrs || '';
    if (/\bclass\s*=\s*["']/i.test(a)) {
      return full.replace(/\bclass\s*=\s*["']/, (m) =>
        m === 'class="' ? 'class="pdf-table ' : "class='pdf-table ",
      );
    }
    return `<table class="pdf-table"${a}>`;
  });

  s = s.replace(/<ul(\s[^>]*)?>/gi, (full, attrs = '') => {
    if (/\bpdf-list\b/.test(full)) return full;
    const a = attrs || '';
    if (/\bclass\s*=\s*["']/i.test(a)) {
      return full.replace(/\bclass\s*=\s*["']/, (m) =>
        m === 'class="' ? 'class="pdf-list ' : "class='pdf-list ",
      );
    }
    return `<ul class="pdf-list"${a}>`;
  });

  s = s.replace(/<ol(\s[^>]*)?>/gi, (full, attrs = '') => {
    if (/\bpdf-list\b/.test(full)) return full;
    const a = attrs || '';
    if (/\bclass\s*=\s*["']/i.test(a)) {
      return full.replace(/\bclass\s*=\s*["']/, (m) =>
        m === 'class="' ? 'class="pdf-list ' : "class='pdf-list ",
      );
    }
    return `<ol class="pdf-list"${a}>`;
  });

  s = s.replace(/<blockquote(\s[^>]*)?>/gi, (full, attrs = '') => {
    if (/\bpdf-avoid-break\b/.test(full)) return full;
    const a = attrs || '';
    if (/\bclass\s*=\s*["']/i.test(a)) {
      return full.replace(/\bclass\s*=\s*["']/, (m) =>
        m === 'class="' ? 'class="pdf-avoid-break ' : "class='pdf-avoid-break ",
      );
    }
    return `<blockquote class="pdf-avoid-break"${a}>`;
  });

  s = s.replace(/<div(\s+[^>]*?\bclass\s*=\s*["']([^"']*)["'])/gi, (full, _rest, classes) => {
    if (/\bpdf-card\b/.test(full)) return full;
    const cls = String(classes);
    const namedCard =
      /\b(card|outcome-card|scope-card|roadmap-card|pain-card|why-block|section-card|next-steps?|grid-card)\b/i.test(
        cls,
      );
    /** Tailwind-style bordered tiles (Expected outcomes, etc.) often omit *-card in the class list. */
    const borderedTile =
      /\brounded\b/i.test(cls) &&
      (/\bborder(?:-|$|[\s"'])/i.test(cls) ||
        /\bring(?:-|$|[\s"'])/i.test(cls) ||
        /\bshadow(?:-|$|[\s"'])/i.test(cls));
    if (namedCard || borderedTile) {
      const extra =
        /\boutcome-card\b/i.test(cls)
          ? ''
          : /\bnext-steps?\b/i.test(cls)
            ? ' next-step-card'
            : /\bsummary-card\b/i.test(cls)
              ? ' summary-card'
              : '';
      return full.replace(/\bclass\s*=\s*["']/, (m) =>
        m === 'class="'
          ? `class="pdf-card proposal-card pdf-avoid-break${extra} `
          : `class='pdf-card proposal-card pdf-avoid-break${extra} `,
      );
    }
    return full;
  });

  const chunks = s.split(/(?=<h2\b)/i);
  const sections = chunks
    .filter((c) => c.trim())
    .map((chunk, i) => {
      const inner = chunk.trim();
      const soft = i > 0 ? ' pdf-soft-break-before' : '';
      return `<section class="section-block pdf-section${soft}">${inner}</section>`;
    })
    .join('\n');

  return `<div class="pdf-body-normalized">${sections}</div>`;
};

const bodyInnerNormalized = normalizeProposalBodyHtml(bodyInner);

/** "What we heard" is Claude's professional summary of the website intake, not the raw JSON object. */
const whatWeHeardBase =
  painSummaryForShell ||
  summarizeIntakeForPdf() ||
  stripIntakeJsonTails(String(d.rawPainPoints || d.painPoints || '')).trim();
const whatWeHeardPlain = noEmDash(whatWeHeardBase);
const whatWeHeardBody =
  whatWeHeardPlain.replace(/\s+/g, ' ').length >= 3
    ? whatWeHeardPlain
    : 'No website intake text was found on this deal. Add website intake details and re-run.';
const whatWeHeardSection = `<section class="section-block doc-section doc-section--pain-shell pdf-section section-block--what-we-heard">
        <h2 class="doc-section__title pdf-heading keep-with-next"><span class="doc-section__accent" aria-hidden="true"></span>What we heard</h2>
        <p class="body-text pain-shell">${escapeHtml(whatWeHeardBody).replace(/\n/g, '<br/>')}</p>
      </section>`;

const html = `<!DOCTYPE html>
<html lang="en"${htmlRootClass}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposal - ${escapeHtml(clientName)} - ${escapeHtml(companyName)}</title>
  <!-- No webfonts: Puppeteer PDF uses system fonts with stable metrics (avoids "l"/kerning glitches from remote fonts). -->
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
      --iw-print-footer-block: 0.62in;
      /**
       * Per-printed-page margins: padding on .pdf-page-safe does NOT repeat at each page break — only @page does.
       * PDF service (Puppeteer) jsonBody uses margin 0 so these CSS margins define the Letter printable inset (preferCSSPageSize).
       */
      --pdf-page-margin-top: 0.65in;
      --pdf-page-margin-bottom: 0.75in;
      --pdf-page-margin-inline: 0.65in;
      /* Extra horizontal inset inside the page box for header/hero/meta/footer text (optional micro-gutter). */
      --pdf-band-pad-inline: 0.12in;
      /**
       * Single stack for PDF: Arial/Helvetica embed & substitute predictably in Acrobat/viewers;
       * avoids Chromium print raster issues with many hosted sans fonts (incl. DM Sans).
       */
      --iw-font-pdf: Arial, Helvetica, 'Liberation Sans', 'Helvetica Neue', sans-serif;
    }
    @page {
      size: Letter;
      margin: 0.65in 0.65in 0.75in 0.65in;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /** Match header/footer chroma so Puppeteer gutters (top/sides) read as intentional bleed with printBackground. */
    html {
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      max-width: 100%;
      background: var(--iw-slate-950);
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      max-width: 100%;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
      font-family: var(--iw-font-pdf);
      font-kerning: normal;
      font-synthesis: none;
      font-optical-sizing: none;
      font-variant-ligatures: none;
      font-feature-settings: normal;
      text-rendering: optimizeLegibility;
      letter-spacing: normal;
    }
    .iw-page {
      width: 100%;
      max-width: 100%;
      min-height: 0;
      margin: 0;
      padding: 0;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
    }
    img {
      max-width: 100%;
      height: auto;
    }
    /**
     * White main column: @page margins already inset every sheet — do not duplicate large vertical padding here
     * or only the first/last page get extra air while mid-page breaks stay flush.
     */
    .pdf-page-safe {
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      padding-bottom: 0;
      box-sizing: border-box;
    }
    /** Full-bleed bands (header / hero / meta) span edge-to-edge; inner padding keeps text inset. */
    .doc-header,
    .doc-hero,
    .doc-meta-bar,
    .doc-footer {
      width: 100%;
      box-sizing: border-box;
    }
    .doc-header__left {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      min-height: 36px;
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
      padding: 14px var(--pdf-band-pad-inline);
      background: var(--iw-slate-950);
      border-bottom: 3px solid var(--iw-teal);
      color: var(--iw-white);
      margin-top: 0;
    }
    .doc-header__logo {
      max-height: 36px;
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
      padding: 28px var(--pdf-band-pad-inline) 26px;
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
      padding: 0 var(--pdf-band-pad-inline);
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
      padding: 0;
    }
    @media print {
      .doc-body {
        padding-bottom: 0;
      }
    }
    .pdf-page-safe > * + * {
      margin-top: 28px;
    }
    /** Shared print semantics (screen-safe defaults). */
    .pdf-section {
      break-inside: auto;
      page-break-inside: auto;
    }
    .pdf-heading.pdf-heading--sub,
    .pdf-heading--sub {
      font-size: 11pt;
    }
    .pdf-card-grid {
      display: grid;
      gap: 14px 20px;
    }
    .pdf-soft-break-before {
      break-before: auto;
      page-break-before: auto;
    }
    .pdf-page-break-before {
      break-before: page;
      page-break-before: always;
    }
    .pdf-keep-together {
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .pdf-avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    /** Intentional fragmentation helpers (also referenced from generated Claude HTML). */
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .page-break-before {
      break-before: page;
      page-break-before: always;
    }
    .page-break-after {
      break-after: page;
      page-break-after: always;
    }
    .keep-with-next {
      break-after: avoid-page;
      page-break-after: avoid;
    }
    .section-block {
      break-inside: auto;
      page-break-inside: auto;
    }
    html.debug-print-layout .section-block,
    html.debug-print-layout .proposal-masthead,
    html.debug-print-layout .doc-section,
    html.debug-print-layout .pdf-section,
    html.debug-print-layout .pdf-card,
    html.debug-print-layout .proposal-card,
    html.debug-print-layout .summary-card,
    html.debug-print-layout .outcome-card,
    html.debug-print-layout .next-step-card,
    html.debug-print-layout table,
    html.debug-print-layout .doc-footer {
      outline: 1px solid rgba(220, 38, 38, 0.45);
      outline-offset: -1px;
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
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 10pt;
    }
    /** Item gets most width; Tier stays narrow and close to Amount. */
    .line-table__col-item {
      width: 77%;
    }
    .line-table__col-tier {
      width: 9%;
    }
    .line-table__col-amount {
      width: 14%;
    }
    .pricing-table,
    table.pdf-table:not(.line-table) {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
    }
    .line-table th,
    .line-table td,
    .pdf-table th,
    .pdf-table td {
      overflow-wrap: anywhere;
      word-break: normal;
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
    .line-table thead th:nth-child(2) {
      text-align: right;
      padding-right: 6px;
    }
    .line-table thead th:last-child {
      text-align: right;
      padding-left: 8px;
    }
    .line-table td.line-table__tier {
      text-align: right;
      font-weight: 600;
      color: var(--iw-slate-700);
      padding-left: 8px;
      padding-right: 6px;
    }
    .investment-narrative {
      font-size: 10pt;
      line-height: 1.65;
      color: var(--iw-slate-800);
      margin: 0 0 16px;
    }
    .investment-narrative.muted {
      color: var(--iw-slate-500);
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
    .line-table td:first-child {
      padding-right: 10px;
    }
    .line-table td.num {
      text-align: right;
      font-weight: 700;
      color: var(--iw-slate-800);
      white-space: nowrap;
      padding-left: 8px;
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
      font-weight: 700;
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
      font-weight: 700;
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
    .body-text,
    .pain-shell,
    .investment-narrative {
      font-kerning: normal;
      letter-spacing: normal;
      font-synthesis: none;
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
    /**
     * Next steps (Claude): row layout with teal circle left, copy right; number centered in circle.
     * Print block below re-applies with !important and exempts these cards from flex-flattening.
     */
    .proposal-body .next-step-card {
      padding: 14px 16px;
      margin-bottom: 12px;
      border: 1px solid var(--iw-slate-100);
      border-radius: 10px;
      background: var(--iw-white);
      box-sizing: border-box;
    }
    .proposal-body .next-step-card:has(> [class*='flex']) {
      display: block;
    }
    .proposal-body .next-step-card:not(:has(> [class*='flex'])) {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 14px;
    }
    .proposal-body .next-step-card:not(:has(> [class*='flex'])) > :last-child {
      flex: 1 1 auto;
      min-width: 0;
    }
    .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 14px;
      width: 100%;
      min-width: 0;
    }
    .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] > :last-child {
      flex: 1 1 auto;
      min-width: 0;
    }
    .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] > :first-child,
    .proposal-body .next-step-card:not(:has(> [class*='flex'])) > :first-child {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 2.375rem;
      height: 2.375rem;
      min-width: 2.375rem;
      border-radius: 9999px;
      background: var(--iw-teal);
      color: var(--iw-white);
      font-weight: 700;
      font-size: 11pt;
      line-height: 1;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    .proposal-body .next-step-card h3,
    .proposal-body .next-step-card .pdf-heading--sub {
      margin: 0 0 6px;
    }
    .proposal-body .next-step-card p {
      margin: 0;
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
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 12px 24px;
      padding: 16px var(--pdf-band-pad-inline) 18px;
      margin-top: 0;
      background: var(--iw-slate-950);
      color: var(--iw-slate-300);
      font-size: 8pt;
      writing-mode: horizontal-tb;
    }
    @media print {
      .doc-footer {
        break-inside: avoid;
        page-break-inside: avoid;
        break-before: avoid;
        page-break-before: avoid;
      }
      .doc-footer,
      .doc-footer * {
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
      }
    }
    .doc-footer__brand {
      flex: 0 0 auto;
      font-weight: 700;
      color: var(--iw-teal-light);
      letter-spacing: 0.04em;
    }
    .doc-footer__conf {
      flex: 1 1 280px;
      min-width: min(100%, 260px);
      text-align: left;
      color: var(--iw-slate-400);
      line-height: 1.45;
      writing-mode: horizontal-tb;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .fine-print {
      font-size: 9pt;
      color: var(--iw-slate-500);
      line-height: 1.5;
      margin-top: 8px;
    }
    .proposal-body p,
    .proposal-body li,
    .body-text {
      orphans: 3;
      widows: 3;
    }
    @media print {
      html {
        width: 100%;
        background: var(--iw-slate-950) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html,
      body {
        height: auto;
        overflow: visible !important;
      }
      body {
        width: 100%;
        background: var(--iw-slate-50);
      }
      .pdf-page-safe {
        overflow: visible !important;
      }
      /**
       * Print/PDF: same font stack everywhere (!important) so inline/HTML cannot pull remote fonts.
       * optimizeSpeed + normal tracking — Arial metrics do not need synthetic letter-spacing fixes.
       */
      body,
      .iw-page,
      .iw-page * {
        font-family: var(--iw-font-pdf) !important;
      }
      body {
        font-synthesis: none !important;
        font-optical-sizing: none !important;
        font-variant-ligatures: none !important;
        font-feature-settings: normal !important;
        text-rendering: optimizeSpeed !important;
        font-kerning: normal !important;
        -webkit-font-smoothing: antialiased;
      }
      /** Claude prose only: reset tracking so it matches Arial (do not clobber header/footer letter-spacing). */
      .proposal-body,
      .proposal-body * {
        letter-spacing: normal !important;
      }
      /** Large wrappers paginate; avoid only on headings/cards/t rows — never on whole proposal-body. */
      .doc-body section.doc-section,
      .pdf-body-normalized .pdf-section {
        break-inside: auto;
        page-break-inside: auto;
      }
      .doc-section__title,
      .pdf-heading.doc-section__title {
        break-after: avoid;
        page-break-after: avoid;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      /** Keep shell headings glued to the next block so a title never sits alone at page bottom. */
      .doc-section__title + * {
        break-before: avoid;
        page-break-before: avoid;
      }
      .pdf-body-normalized .pdf-section > .pdf-heading:first-child,
      .pdf-body-normalized .pdf-section > h2:first-child {
        break-after: avoid;
        page-break-after: avoid;
      }
      .pdf-body-normalized .pdf-section > .pdf-heading--sub,
      .proposal-body .pdf-card .pdf-heading--sub {
        break-after: avoid;
        page-break-after: avoid;
      }
      .doc-hero {
        break-after: avoid;
        page-break-after: avoid;
      }
      /** Client snapshot: grid may span pages; each KV cell stays intact (not half a cell). */
      .kv-grid {
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
      .kv-grid.kv-grid--3col,
      .kv-grid.pdf-card-grid {
        grid-template-columns: 1fr !important;
      }
      .kv-grid > div {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      /**
       * Pricing / line-items table: may span pages; rows stay intact (break-inside on tr).
       * Avoiding break-inside on the whole table prevents clipping when many line items exist.
       */
      .line-table,
      .pricing-table {
        display: table !important;
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
      /** Claude / long tables: allow pagination; row + thead pairing rules below. */
      .pdf-table:not(.line-table) {
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
        break-inside: auto;
        page-break-inside: auto;
      }
      .line-table thead,
      .pdf-table thead {
        display: table-header-group !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .line-table tbody,
      .pdf-table tbody {
        display: table-row-group !important;
      }
      .line-table tbody tr:first-child,
      .pdf-table tbody tr:first-child {
        break-before: avoid !important;
        page-break-before: avoid !important;
      }
      .line-table tbody tr,
      .pdf-table tbody tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .line-table tr.line-table__schedule {
        break-before: avoid;
        page-break-before: avoid;
      }
      .line-table tr.line-table__total {
        break-after: avoid;
        page-break-after: avoid;
      }
      .proposal-body h2,
      .doc-prose-h2,
      .proposal-body .pdf-heading:not(.pdf-heading--sub) {
        break-after: avoid;
        page-break-after: avoid;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .proposal-body h3,
      .proposal-body .pdf-heading--sub {
        break-after: avoid;
        page-break-after: avoid;
      }
      /** Unified card treatment: flow-root + avoid — flex/grid children can otherwise ignore break-inside on the parent. */
      .proposal-body .pdf-card,
      .proposal-body .proposal-card,
      .proposal-body .summary-card,
      .proposal-body .scope-card,
      .proposal-body .roadmap-card,
      .proposal-body .outcome-card,
      .proposal-body .next-step-card,
      .proposal-body .pain-card,
      .proposal-body .why-block,
      .proposal-body .section-card {
        display: flow-root !important;
        position: relative !important;
        float: none !important;
        overflow: visible !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      /** Flatten multi-column outcome/grids so each card is a horizontal strip — avoids splitting a row across pages. */
      .proposal-body .pdf-card-grid:not(.kv-grid),
      .proposal-body div[class*="grid"]:not(.kv-grid),
      .proposal-body div[style*="display:grid"],
      .proposal-body div[style*="display: grid"],
      .proposal-body div[style*="grid-template-columns"] {
        display: block !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
      .proposal-body .pdf-card-grid:not(.kv-grid) > .pdf-card,
      .proposal-body .pdf-card-grid:not(.kv-grid) > div {
        display: block !important;
        width: 100% !important;
        margin-bottom: 12px !important;
      }
      /** Claude outcome grids: each direct tile stays intact; nested flex inside tile is flattened for print. */
      .proposal-body div[class*="grid"]:not(.kv-grid) > * {
        display: flow-root !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .proposal-body .pdf-card > *,
      .proposal-body div[class*="grid"]:not(.kv-grid) > * > * {
        min-height: 0 !important;
      }
      .proposal-body .pdf-card:not(.next-step-card) .flex,
      .proposal-body .pdf-card:not(.next-step-card) [class*="flex"] {
        display: block !important;
      }
      /** Next steps: keep inner flex row; circle left + centered digit, text column right. */
      .proposal-body .next-step-card {
        padding: 14px 16px !important;
        margin-bottom: 12px !important;
        border: 1px solid var(--iw-slate-100) !important;
        border-radius: 10px !important;
        background: var(--iw-white) !important;
        box-sizing: border-box !important;
      }
      .proposal-body .next-step-card:has(> [class*='flex']) {
        display: block !important;
      }
      .proposal-body .next-step-card:not(:has(> [class*='flex'])) {
        display: flex !important;
        flex-direction: row !important;
        align-items: flex-start !important;
        gap: 14px !important;
      }
      .proposal-body .next-step-card:not(:has(> [class*='flex'])) > :last-child {
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
      .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] {
        display: flex !important;
        flex-direction: row !important;
        align-items: flex-start !important;
        gap: 14px !important;
        width: 100% !important;
        min-width: 0 !important;
      }
      .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] > :last-child {
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
      .proposal-body .next-step-card:has(> [class*='flex']) > [class*='flex'] > :first-child,
      .proposal-body .next-step-card:not(:has(> [class*='flex'])) > :first-child {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
        width: 2.375rem !important;
        height: 2.375rem !important;
        min-width: 2.375rem !important;
        border-radius: 9999px !important;
        background: var(--iw-teal) !important;
        color: var(--iw-white) !important;
        font-weight: 700 !important;
        font-size: 11pt !important;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      .proposal-body .next-step-card h3,
      .proposal-body .next-step-card .pdf-heading--sub {
        margin: 0 0 6px !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .proposal-body .next-step-card p {
        margin: 0 !important;
      }
      .proposal-body .pdf-card:not(.next-step-card) h3,
      .proposal-body .pdf-card:not(.next-step-card) .pdf-heading--sub {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      /** Long narrative shells still flow across pages. */
      .callout,
      .callout--orange,
      .callout--slate,
      .doc-section--pain-shell,
      .doc-section--intake-themes {
        break-inside: auto;
        page-break-inside: auto;
      }
      .proposal-body hr.divider {
        break-before: avoid;
        page-break-before: avoid;
      }
      .pdf-last-main-block {
        margin-bottom: 4px;
      }
      footer.doc-footer {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .proposal-body p,
      .proposal-body li,
      .doc-section .body-text {
        orphans: 3;
        widows: 3;
      }
    }
  </style>
</head>
<body>
  <div class="iw-page">
    <div class="section-block proposal-masthead avoid-break">
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
    </div>

    <main class="doc-body">
      <div class="pdf-page-safe">
      <section class="section-block doc-section pdf-section section-block--client-snapshot avoid-break">
        <h2 class="doc-section__title pdf-heading keep-with-next"><span class="doc-section__accent" aria-hidden="true"></span>Client snapshot</h2>
        <div class="kv-grid kv-grid--3col pdf-card-grid">
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

      ${whatWeHeardSection}

      <section class="section-block doc-section pdf-section section-block--investment">
        <h2 class="doc-section__title pdf-heading keep-with-next"><span class="doc-section__accent" aria-hidden="true"></span>Investment summary</h2>
        ${investmentNarrativeHtml}
        <table class="line-table pdf-table pricing-table">
          <colgroup>
            <col class="line-table__col-item" />
            <col class="line-table__col-tier" />
            <col class="line-table__col-amount" />
          </colgroup>
          <thead><tr><th>Item</th><th>Tier</th><th>Amount</th></tr></thead>
          <tbody>
            ${lineItemsRowsHtml}
            <tr class="line-table__schedule"><td colspan="3">Payment timing (estimate; final cadence on invoice)</td></tr>
            <tr><td colspan="2">Upfront due (40% of quoted total)</td><td class="num">${escapeHtml(upfrontDueText)}</td></tr>
            <tr class="line-table__total"><td colspan="2">Remaining balance</td><td class="num">${escapeHtml(remainingBalanceText)}</td></tr>
          </tbody>
        </table>
        <p class="fine-print">Payment split shown as 40% upfront and 60% remaining from quoted total. Final amounts on invoice.</p>
      </section>

      <section class="section-block doc-section proposal-body pdf-section pdf-last-main-block section-block--proposal-narrative">
        ${bodyInnerNormalized}
        <hr class="divider" />
        <p class="body-text pdf-footer-contact" style="margin-bottom: 4px"><strong>${escapeHtml(companyName)}</strong>${ownerEmail ? ` · ${escapeHtml(ownerEmail)}` : ''}${ownerPhone ? ` · ${escapeHtml(ownerPhone)}` : ''}</p>
        ${calendarHtml}
      </section>
      </div>
    </main>

    <footer class="doc-footer pdf-footer-flow section-block section-block--footer-confidential">
      <div class="doc-footer__brand">IntraWeb</div>
      <div class="doc-footer__conf">Confidential - prepared for ${escapeHtml(clientName)}. Distribution outside the parties requires written consent.</div>
    </footer>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb - ${d.clientName} - Proposal.pdf` } }];
