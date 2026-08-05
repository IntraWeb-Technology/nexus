const MAX = 7;
const d = $('Extract Input Data').first().json;
const prompts = $('Prep Section Prompts').all().slice(0, MAX);
const generated = $input.all().slice(0, MAX);
const config = d.config || {};
const branding = config.branding || {};
const owner = config.owner || {};
const accountMgr = owner.name || 'IntraWeb';
const companyName = owner.companyName || 'IntraWeb Technologies LLC';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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

const sectionBody = (section) => {
  const j = section.json || {};
  if (j.data && typeof j.data.text === 'string' && j.data.text.trim()) return j.data.text;
  if (typeof j.text === 'string' && j.text.trim()) return j.text;
  if (j.success === false && j.error) {
    const safe = String(j.error).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<section><p class="body-text" style="color:var(--iw-orange-dim)"><strong>Section failed:</strong> ${safe}</p></section>`;
  }
  return '<section><p class="body-text" style="color:var(--iw-orange-dim)">No content was returned for this section.</p></section>';
};

const fileNameFor = (sectionTitle) => {
  const t = String(sectionTitle || 'Section')
    .replace(/[/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Section';
  return `IntraWeb — ${d.clientName} — ${t}.pdf`;
};

const styles = `<style>
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
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: var(--iw-slate-50); color: var(--iw-slate-700); font-family: 'DM Sans', system-ui, sans-serif; }
  .iw-page { width: 816px; min-height: 1056px; margin: 0 auto; background: var(--iw-slate-50); }
  .doc-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 24px; background: var(--iw-slate-950); border-bottom: 3px solid var(--iw-teal); color: var(--iw-white); }
  .doc-header__logo { height: 36px; width: auto; display: block; }
  .doc-header__wordmark { font-size: 18px; font-weight: 700; letter-spacing: 0.04em; color: var(--iw-white); }
  .doc-header__doc-type { font-size: 9pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--iw-slate-300); }
  .doc-header__doc-id { font-size: 10pt; font-weight: 600; color: var(--iw-white); margin-top: 4px; text-align: right; }
  .doc-hero { background: var(--iw-slate-900); padding: 24px 32px 22px; color: var(--iw-white); }
  .doc-hero__label { display: inline-block; font-size: 9pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--iw-orange); margin-bottom: 8px; }
  .doc-hero__label::before { content: '— '; color: var(--iw-orange); }
  .doc-hero__title { margin: 0 0 8px; font-size: 18pt; font-weight: 700; line-height: 1.2; color: var(--iw-white); }
  .doc-hero__subtitle { margin: 0; font-size: 10.5pt; line-height: 1.5; color: var(--iw-slate-300); max-width: 640px; }
  .doc-meta-bar { display: flex; flex-wrap: wrap; background: var(--iw-slate-800); color: var(--iw-slate-100); font-size: 9.5pt; }
  .doc-meta-bar__item { flex: 1 1 0; min-width: 120px; padding: 10px 14px; border-right: 1px solid var(--iw-slate-600); }
  .doc-meta-bar__item:last-child { border-right: none; }
  .doc-meta-bar__k { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--iw-slate-400); margin-bottom: 4px; }
  .doc-meta-bar__v { font-weight: 600; color: var(--iw-white); word-break: break-word; }
  .doc-body { background: var(--iw-white); padding: 28px 44px 36px; }
  .onb-prose h1, .onb-prose h2, .onb-prose h3 { color: var(--iw-slate-800); }
  .onb-prose h1 { font-size: 16pt; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1.5px solid var(--iw-slate-100); }
  .onb-prose h2 { font-size: 13pt; margin: 22px 0 10px; }
  .onb-prose h3 { font-size: 11pt; color: var(--iw-teal-dim); margin: 16px 0 8px; }
  .onb-prose p, .onb-prose li { font-size: 10pt; line-height: 1.7; color: var(--iw-slate-700); }
  .onb-prose a { color: var(--iw-teal-dim); }
  .onb-prose table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; }
  .onb-prose th, .onb-prose td { padding: 8px 10px; border-bottom: 1px solid var(--iw-slate-100); text-align: left; }
  .onb-prose th { background: var(--iw-slate-950); color: var(--iw-white); }
  .doc-footer { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; gap: 12px; padding: 12px 24px; background: var(--iw-slate-950); color: var(--iw-slate-300); font-size: 8pt; }
  .doc-footer__brand { font-weight: 700; color: var(--iw-teal-light); letter-spacing: 0.04em; }
  .doc-footer__conf { text-align: center; color: var(--iw-slate-400); line-height: 1.4; }
  .doc-footer__page { text-align: right; color: var(--iw-slate-300); font-weight: 600; }
  .body-text { font-size: 10pt; line-height: 1.75; color: var(--iw-slate-700); margin: 0 0 8px; }
</style>`;

const n = Math.min(MAX, prompts.length, generated.length);
const out = [];
for (let i = 0; i < n; i++) {
  const sectionName =
    prompts[i] && prompts[i].json && prompts[i].json.sectionName
      ? prompts[i].json.sectionName
      : `Section ${i + 1}`;
  const body = generated[i]
    ? sectionBody(generated[i])
    : '<section><p class="body-text" style="color:var(--iw-orange-dim)">Missing generated output for this section.</p></section>';
  const docId = `ONB-${i + 1}-${Date.now().toString(36).toUpperCase()}`;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const safeSection = escapeHtml(sectionName);
  const safeClient = escapeHtml(String(d.clientName));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeSection} — ${safeClient}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
  ${styles}
</head>
<body>
  <div class="iw-page">
    <header class="doc-header">
      <div class="doc-header__left">${logoHtml}</div>
      <div>
        <div class="doc-header__doc-type">Client Onboarding</div>
        <div class="doc-header__doc-id">${escapeHtml(docId)}</div>
      </div>
    </header>
    <section class="doc-hero">
      <div class="doc-hero__label">Client Onboarding</div>
      <h1 class="doc-hero__title">${safeSection}</h1>
      <p class="doc-hero__subtitle">${safeClient} · Prepared by ${escapeHtml(companyName)}</p>
    </section>
    <div class="doc-meta-bar">
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Client</div>
        <div class="doc-meta-bar__v">${safeClient}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Date</div>
        <div class="doc-meta-bar__v">${escapeHtml(today)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Account manager</div>
        <div class="doc-meta-bar__v">${escapeHtml(accountMgr)}</div>
      </div>
    </div>
    <main class="doc-body onb-prose">${body}</main>
    <footer class="doc-footer">
      <div class="doc-footer__brand">IntraWeb</div>
      <div class="doc-footer__conf">Confidential — onboarding materials for ${safeClient}.</div>
      <div class="doc-footer__page">Page 1</div>
    </footer>
  </div>
</body>
</html>`;
  out.push({ json: { html, fileName: fileNameFor(sectionName), sectionName } });
}
return out;
