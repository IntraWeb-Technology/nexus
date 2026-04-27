const deal = $('Deal Proposal Stage Webhook').first().json;
const config = $('Get Config').first().json;

const fetchedDeal = (() => {
  try {
    return $('Fetch Deal With Associations').first().json;
  } catch {
    return null;
  }
})();

const associatedContact = (() => {
  try {
    const rows = $('Fetch Primary Contact').all();
    if (!rows.length) return {};
    const c = rows[0].json;
    return (c && typeof c.properties === 'object' && c.properties) || {};
  } catch {
    return {};
  }
})();

const associatedLineItems = (() => {
  const hubSpotObject = (o) =>
    o &&
    typeof o === 'object' &&
    o.id != null &&
    o.properties &&
    typeof o.properties === 'object';

  const collectFromJson = (out) => {
    if (!out || typeof out !== 'object') return [];
    // n8n HTTP or proxies may nest the parsed HubSpot object
    if (!hubSpotObject(out)) {
      const nested = [out.body, out.data, out.json].find(hubSpotObject);
      if (nested) return collectFromJson(nested);
    }
    if (Array.isArray(out.results) && out.results.length) return out.results;
    if (hubSpotObject(out)) return [out];
    if (Array.isArray(out)) return out;
    return [];
  };
  try {
    const rows = [];
    const seen = new Set();
    const addAll = (arr) => {
      for (const x of arr) {
        if (!x || typeof x !== 'object' || (x.error && !x.id)) continue;
        const id = x && (x.id ?? x.properties?.hs_object_id);
        const key = id != null ? String(id) : JSON.stringify(x);
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(x);
      }
    };
    const httpItems = $('Fetch Associated Line Items').all();
    if (httpItems.length) {
      for (const it of httpItems) {
        const j = it.json;
        if (!j || typeof j !== 'object') continue;
        addAll(collectFromJson(j));
      }
    } else {
      const first = $('Fetch Associated Line Items').first();
      if (first?.json) addAll(collectFromJson(first.json));
    }
    return rows;
  } catch {
    return [];
  }
})();

/** n8n may receive flat HubSpot shape, { body }, or router envelope { webhookBody }. */
const unwrapPayload = (root) => {
  if (!root || typeof root !== 'object') return root;
  if (root.webhookBody && typeof root.webhookBody === 'object') return root.webhookBody;
  if (root.payload && typeof root.payload === 'object') return root.payload;
  return root;
};

const inner = unwrapPayload(deal);
const body =
  inner.body && typeof inner.body === 'object' && !Array.isArray(inner.body) ? inner.body : inner;

/** HubSpot GET deal fills gaps when webhook omits contact_* or mirror fields. Webhook props win on conflict. */
const apiProps =
  fetchedDeal && typeof fetchedDeal.properties === 'object' && fetchedDeal.properties
    ? fetchedDeal.properties
    : {};

/** SYS 00 / routers may send either `properties: {}` or flat deal fields on the body. Flat shape was dropping deal_pain_points, tier, and line-item context. */
const rawWebhookShape =
  body.properties && typeof body.properties === 'object' && !Array.isArray(body.properties)
    ? body.properties
    : typeof body === 'object' && body && !Array.isArray(body)
      ? body
      : {};
const webhookOmit = new Set([
  'associations',
  'lineItems',
  'line_items',
  'properties',
  'createdAt',
  'updatedAt',
  'archived',
]);
const webhookProps = Object.fromEntries(
  Object.entries(rawWebhookShape).filter(([k]) => !webhookOmit.has(k)),
);
const props = { ...apiProps, ...webhookProps };

/** HubSpot router envelope may include merged contact props (preferred for client-facing fields). */
const merged =
  (deal.source && typeof deal.source === 'object' && deal.source.contactsMerged) ||
  (typeof deal.contactsMerged === 'object' && deal.contactsMerged) ||
  {};

const valueFrom = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
};

const money = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const normalized = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
};

const titleCase = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '');

/** PDF / UI: avoid em/en dashes in names and labels. */
const cleanDashes = (value) =>
  String(value ?? '')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/—/g, '-');

const normalizeText = (value) => String(value ?? '').replace(/\r/g, '').trim();

const parseJsonObject = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const joinValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean).join(', ');
  }
  return String(value ?? '').trim();
};

const formatWebsiteIntakeJson = (intake) => {
  if (!intake || typeof intake !== 'object') return '';
  const rows = [];
  const add = (label, value) => {
    const text = joinValue(value);
    if (text) rows.push(`${label}: ${text}`);
  };

  const contact = intake.contact || {};
  const goals = intake.goals || {};
  const design = intake.design || {};
  const content = intake.content || {};
  const budget = intake.budget || {};
  const research = intake.research || {};

  add('Name', [contact.firstName, contact.lastName].filter(Boolean).join(' '));
  add('Email', contact.email);
  add('Phone', contact.phone);
  add('Business', contact.businessName || contact.company || contact.business);
  add('Industry', contact.industry);
  add('Location', contact.location);
  add('Website', contact.website);
  add('Business description', contact.bizDesc || contact.businessDescription);
  add('Goals', goals.goals);
  add('Outcome / detail', goals.goalDetail || goals.outcome);
  add('Timeline', goals.timeline);
  add('Audience', goals.audience);
  add('Vibe', design.vibe);
  add('Logo', design.hasLogo);
  add('Font style', design.fontStyle);
  add('Photos', design.hasPhotos);
  add("Don't want", design.dontWant);
  add('Design notes', design.designNotes);
  add('Pages', content.pages);
  add('Other pages', content.otherPages);
  add('Copywriter', content.copywriter);
  add('CMS', content.cms);
  add('Features / integrations', content.features);
  add('Budget range', budget.range);
  add('Ongoing support', budget.ongoing);
  add('Funding', budget.funding);
  add('Payment preference', budget.payment);
  add('Budget notes', budget.notes);
  add('Competitors', research.competitors);
  add('Sites you love', research.inspiration);
  add('What you like', research.likeAbout);
  add('What you dislike', research.dislikeAbout);
  add('Differentiator', research.differentiator);
  add('Final notes', research.finalNotes);

  return rows.length ? `Website intake (from HubSpot website_intake_json):\n${rows.join('\n')}` : '';
};

/** Parse line items from payload: arrays on body/properties, JSON string, or HubSpot hs_line_items JSON. */
const parseLineItemsRaw = () => {
  const candidates = [
    associatedLineItems,
    body.lineItems,
    body.line_items,
    props.lineItems,
    props.line_items,
    props.hs_line_items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
    if (typeof c === 'string' && c.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) {
        /* ignore */
      }
    }
  }
  return [];
};

const normalizeLineItems = (raw) => {
  return raw
    .map((x, i) => {
      if (!x || typeof x !== 'object') return null;
      const p = x.properties && typeof x.properties === 'object' ? x.properties : {};
      const qty = Math.max(1, Number(x.quantity ?? x.qty ?? x.hs_quantity ?? p.quantity ?? 1) || 1);
      const unit = money(
        x.unitPrice ?? x.price ?? x.rate ?? x.hs_price ?? x.hs_unit_price ?? p.price ?? p.hs_price,
      );
      const lineTotal = money(
        x.amount ??
          x.line_amount ??
          x.total ??
          x.line_total ??
          x.hs_line_item_amount ??
          p.amount ??
          p.hs_line_item_amount,
      );
      const name = valueFrom(
        x.name,
        x.productName,
        x.title,
        x.hs_sku,
        p.name,
        p.hs_name,
        p.hs_sku,
        `Line item ${i + 1}`,
      );
      const sku = valueFrom(x.hs_sku, x.sku, p.hs_sku, p.sku, '');
      const description = valueFrom(x.description, x.details, x.notes, p.description, '');
      const productId = valueFrom(x.hs_product_id, p.hs_product_id, '');
      const productType = cleanDashes(valueFrom(x.hs_product_type, p.hs_product_type, ''));
      const recordId = valueFrom(x.hs_object_id, p.hs_object_id, '');
      const billingFrequency = cleanDashes(
        valueFrom(
          x.recurringbillingfrequency,
          x.billing_frequency,
          p.recurringbillingfrequency,
          p.billing_frequency,
          '',
        ),
      );
      const recurringPeriod = cleanDashes(
        valueFrom(x.hs_recurring_billing_period, p.hs_recurring_billing_period, ''),
      );
      const discount = valueFrom(
        x.hs_discount_percentage,
        x.discount_percentage,
        x.hs_discount_amount,
        x.discount_amount,
        p.hs_discount_percentage,
        p.discount_percentage,
        p.hs_discount_amount,
        p.discount_amount,
        '',
      );
      const rawMetadata = valueFrom(x.metadata, x.meta_data, p.metadata, p.meta_data, '');
      const metadata = [
        rawMetadata ? `Metadata: ${rawMetadata}` : '',
        sku ? `SKU: ${sku}` : '',
        productType ? `Product type: ${productType}` : '',
        productId ? `Product ID: ${productId}` : '',
        recordId ? `Line item ID: ${recordId}` : '',
        billingFrequency ? `Billing frequency: ${billingFrequency}` : '',
        recurringPeriod ? `Billing period: ${recurringPeriod}` : '',
        discount ? `Discount: ${discount}` : '',
      ].filter(Boolean);
      const tier = cleanDashes(
        valueFrom(
          x.tier,
          x.packageTier,
          x.package_tier,
          x.product_tier,
          x.hs_tier,
          p.tier,
          p.package_tier,
          p.product_tier,
          p.hs_tier,
        ),
      );
      let amount = lineTotal;
      if (!amount && unit) amount = unit * qty;
      if (!amount) amount = 0;
      return {
        name,
        sku,
        description,
        quantity: qty,
        unitPrice: unit || (qty ? amount / qty : amount),
        amount,
        tier,
        metadata,
      };
    })
    .filter(Boolean);
};

const rawLineItems = parseLineItemsRaw();
let lineItems = normalizeLineItems(rawLineItems);

const addressParts = [
  valueFrom(
    props.address,
    props.street,
    props.street_address,
    props.company_address,
    associatedContact.address,
  ),
  valueFrom(props.city, props.company_city, associatedContact.city),
  valueFrom(props.state, props.state_region, props.company_state, associatedContact.state),
  valueFrom(
    props.zip,
    props.zip_code,
    props.postal_code,
    props.company_zip,
    associatedContact.zip,
  ),
  valueFrom(props.country, props.company_country, associatedContact.country),
].filter(Boolean);

/**
 * Deal tier: HubSpot deal property `tier` is the source of truth.
 * tier_label / package_* are fallbacks only when `tier` is blank (legacy portals).
 */
const dealTierHubspot = valueFrom(props.tier);
const hubspotTierRaw = cleanDashes(
  dealTierHubspot || valueFrom(props.tier_label, props.package_tier, props.package),
);
const tierSlug =
  hubspotTierRaw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
const tierKeyCandidates = [
  tierSlug,
  tierSlug.replace(/_tier$/, ''),
  tierSlug.split('_').filter(Boolean)[0] || tierSlug,
].filter(Boolean);
let tierInfo =
  (config.tiers && tierSlug && config.tiers[tierSlug]) || {
    name: titleCase(tierSlug) || '',
    monthlyPrice: 0,
    setupFee: 0,
  };
for (const cand of tierKeyCandidates) {
  if (cand && config.tiers && config.tiers[cand]) {
    tierInfo = config.tiers[cand];
    break;
  }
}
const tierKey = tierKeyCandidates.find((c) => c && config.tiers && config.tiers[c]) || tierSlug || '';
const tierLabelFromDeal =
  cleanDashes(hubspotTierRaw) || tierInfo.name || titleCase(tierSlug) || '';

const websiteIntakeJsonRaw = valueFrom(
  props.website_intake_json,
  props.website_intake_json__c,
  props.website_intake,
  associatedContact.website_intake_json,
  associatedContact.website_intake_json__c,
  associatedContact.website_intake,
  merged.website_intake_json,
);
const websiteIntakeJson = parseJsonObject(websiteIntakeJsonRaw);
const websiteIntakeFromJson = normalizeText(formatWebsiteIntakeJson(websiteIntakeJson));

const rawPainSources = [
  valueFrom(props.deal_pain_points),
  valueFrom(props.painPoints),
  valueFrom(props.pain_point_summary),
  valueFrom(merged.pain_point),
].filter(Boolean);

const websiteIntakeDetails = normalizeText(
  valueFrom(
    websiteIntakeFromJson,
    props.website_intake_details,
    associatedContact.website_intake_details,
    merged.website_intake_details,
    merged.website_intake,
    merged.website_intake_plain,
  ),
);

/** Website intake summary fields only (not generic contact pain_point). */
const intakeSummary = normalizeText(
  valueFrom(props.website_intake_summary, merged.website_intake_summary),
);

const websiteIntakeBlockParts = [];
if (intakeSummary) {
  websiteIntakeBlockParts.push(`Website intake summary:\n${intakeSummary}`);
}
if (websiteIntakeDetails) {
  websiteIntakeBlockParts.push(`Website intake (full):\n${websiteIntakeDetails}`);
}

const extractWebsiteIntakeBlock = (text) => {
  const t = String(text || '');
  const markers = ['=== Website intake (full) ===', 'Website intake (plain):', 'Website intake (full)'];
  let best = '';
  for (const m of markers) {
    const i = t.indexOf(m);
    if (i === -1) continue;
    let chunk = t.slice(i);
    const cut = chunk.search(/\n---\s*\n|\nWebsite intake \(JSON\):/i);
    if (cut !== -1) chunk = chunk.slice(0, cut);
    const norm = normalizeText(chunk);
    if (norm.length > best.length) best = norm;
  }
  return best;
};

const stripHeavyTailsFromPain = (text) => {
  let s = String(text || '');
  for (const re of [
    /\nWebsite intake \(JSON\):[\s\S]*$/i,
    /\nWebsite intake \(structured fields\):[\s\S]*$/i,
    /\n---\s*\nWebsite intake \(JSON\):[\s\S]*$/i,
  ]) {
    s = s.replace(re, '');
  }
  return normalizeText(s);
};

const dealPainPointsFull = valueFrom(props.deal_pain_points);

/** Website intake first: embedded block in deal_pain_points, then dedicated deal/contact fields, then cleaned full pain text. */
const intakeForWhatWeHeard = normalizeText(
  websiteIntakeFromJson ||
    extractWebsiteIntakeBlock(dealPainPointsFull) ||
    websiteIntakeDetails ||
    intakeSummary ||
    stripHeavyTailsFromPain(dealPainPointsFull) ||
    '',
);

/** Claude / downstream: website intake blocks before raw deal notes so the model sees intake first. */
const uniquePainSources = [...new Set([...websiteIntakeBlockParts, ...rawPainSources])];
const painPoints = uniquePainSources.join('\n\n');
const contactFirstName = valueFrom(
  associatedContact.firstname,
  props.contact_firstname,
  props.firstName,
  props.firstname,
);
const contactLastName = valueFrom(
  associatedContact.lastname,
  props.contact_lastname,
  props.lastName,
  props.lastname,
);
const contactName = cleanDashes([contactFirstName, contactLastName].filter(Boolean).join(' '));

const companyName = valueFrom(
  props.company,
  props.company_name,
  props.business_name,
  associatedContact.company,
  props.dealname,
  props.name,
);

const companyDisplay = (() => {
  const c = String(companyName || '').trim();
  if (c && c.toUpperCase() !== 'UNKNOWN') return cleanDashes(c);
  const m = valueFrom(
    merged.company,
    merged.business_name,
    merged.company_name,
    associatedContact.company,
  );
  if (m && String(m).trim().toUpperCase() !== 'UNKNOWN') return cleanDashes(m);
  const dn = valueFrom(props.dealname, props.name);
  if (dn) {
    const short = dn.split(/\s*[–\u2013\u2014-]\s*/)[0].trim();
    return cleanDashes(short || dn);
  }
  return '';
})();

const industryDisplay = cleanDashes(
  valueFrom(
    props.industry,
    associatedContact.industry,
    merged.industry,
    merged.website_intake_industry,
  ),
);

const contactEmailDisplay = cleanDashes(
  valueFrom(
    associatedContact.email,
    merged.email,
    merged.contact_email,
    props.contact_email,
    props.email,
  ),
);

const tierMonthly = money(tierInfo.monthlyPrice);
const upfrontDue = money(tierInfo.setupFee);
const explicitDealAmount = money(props.amount);
const explicitDiscount = money(
  valueFrom(
    props.hs_total_discount,
    props.total_discount,
    props.deal_discount,
    props.discount_amount,
    props.hs_discount,
  ),
);
let impliedDiscount = 0;
if (
  lineItems.length === 1 &&
  explicitDealAmount > 0 &&
  lineItems.every((li) => !(Number(li.amount) > 0))
) {
  lineItems = lineItems.map((li) => ({
    ...li,
    amount: explicitDealAmount,
    unitPrice: explicitDealAmount / (Number(li.quantity) || 1),
  }));
}
const lineItemsSubtotal = lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0);
if (
  explicitDiscount <= 0 &&
  lineItemsSubtotal > 0 &&
  explicitDealAmount > 0 &&
  lineItemsSubtotal > explicitDealAmount + 0.005
) {
  impliedDiscount = lineItemsSubtotal - explicitDealAmount;
}
const totalDiscount = explicitDiscount > 0 ? explicitDiscount : impliedDiscount;

const tierAmount =
  explicitDealAmount > 0
    ? explicitDealAmount
    : lineItemsSubtotal > 0
      ? lineItemsSubtotal
      : upfrontDue;
const dealAmountForDisplay = explicitDealAmount > 0 ? explicitDealAmount : tierAmount;
const remainingTierBalance = Math.max(tierAmount - upfrontDue, 0);
const launchBalance = remainingTierBalance + tierMonthly;

const productList = lineItems.map((i) => ({
  sku: i.sku || '',
  name: i.name || '',
  price: i.unitPrice ?? (i.quantity ? i.amount / i.quantity : i.amount),
}));

return [
  {
    json: {
      clientName: cleanDashes(
        valueFrom(props.dealname, props.name, props.company, props.business_name, props.company_name),
      ),
      company: companyName,
      companyDisplay,
      industry: valueFrom(props.industry),
      industryDisplay,
      painPoints,
      painPointSummary: valueFrom(props.pain_point_summary, props.painPoints),
      rawPainPoints: valueFrom(websiteIntakeDetails, props.deal_pain_points, painPoints),
      websiteIntakeJsonRaw,
      websiteIntakeJsonText: websiteIntakeFromJson,
      dealValue: tierAmount,
      amountLabel: valueFrom(props.amount),
      tierAmount,
      dealAmount: dealAmountForDisplay,
      lineItemsSubtotal,
      totalDiscount,
      tier: tierKey,
      dealTierHubspot: dealTierHubspot ? cleanDashes(dealTierHubspot) : '',
      hubspotTierRaw,
      tierLabel: tierLabelFromDeal || tierInfo.name || titleCase(tierKey) || '',
      tierMonthly,
      monthlyCost: tierMonthly,
      upfrontDue,
      remainingTierBalance,
      launchBalance,
      finalDueAtPreLaunch: launchBalance,
      dealId: valueFrom(
        fetchedDeal?.id,
        fetchedDeal?.properties?.hs_object_id,
        body.dealId,
        inner.dealId,
        deal.dealId,
        body.id,
        inner.id,
        deal.id,
      ),
      contactEmail: valueFrom(
        associatedContact.email,
        props.contact_email,
        props.email,
        merged.email,
      ),
      contactEmailDisplay,
      contactPhone: valueFrom(
        associatedContact.phone,
        associatedContact.mobilephone,
        props.contact_phone,
        props.phone,
        props.mobilephone,
      ),
      contactFirstName,
      contactName: contactName || contactFirstName,
      address: addressParts.join(', '),
      city: valueFrom(props.city, props.company_city),
      state: valueFrom(props.state, props.state_region, props.company_state),
      postalCode: valueFrom(props.zip, props.zip_code, props.postal_code, props.company_zip),
      country: valueFrom(props.country, props.company_country),
      website: valueFrom(
        props.website,
        props.domain,
        props.company_domain,
        associatedContact.website,
        merged.website,
        merged.company_website,
        merged.hs_website,
      ),
      intakeForWhatWeHeard,
      driveFolderId: valueFrom(props.client_drive_folder_id),
      lineItems,
      lineItemsTotal: lineItemsSubtotal,
      productList,
      config,
    },
  },
];
