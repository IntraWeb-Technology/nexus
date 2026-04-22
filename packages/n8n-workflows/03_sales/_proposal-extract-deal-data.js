const deal = $('Deal Proposal Stage Webhook').first().json;
const config = $('Get Config').first().json;

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
const props =
  body.properties && typeof body.properties === 'object' && !Array.isArray(body.properties)
    ? body.properties
    : body;

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

/** Parse line items from payload: arrays on body/properties, JSON string, or HubSpot hs_line_items JSON. */
const parseLineItemsRaw = () => {
  const candidates = [
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
      const qty = Math.max(1, Number(x.quantity ?? x.qty ?? x.hs_quantity ?? 1) || 1);
      const unit = money(x.unitPrice ?? x.price ?? x.rate ?? x.hs_price ?? x.hs_unit_price);
      const lineTotal = money(x.amount ?? x.line_amount ?? x.total ?? x.line_total ?? x.hs_line_item_amount);
      const name = valueFrom(x.name, x.productName, x.title, x.hs_sku, `Line item ${i + 1}`);
      const sku = valueFrom(x.hs_sku, x.sku, '');
      const description = valueFrom(x.description, x.details, x.notes, '');
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
      };
    })
    .filter(Boolean);
};

const rawLineItems = parseLineItemsRaw();
const lineItems = normalizeLineItems(rawLineItems);
const lineItemsSubtotal = lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0);

const addressParts = [
  valueFrom(props.address, props.street, props.street_address, props.company_address),
  valueFrom(props.city, props.company_city),
  valueFrom(props.state, props.state_region, props.company_state),
  valueFrom(props.zip, props.zip_code, props.postal_code, props.company_zip),
  valueFrom(props.country, props.company_country),
].filter(Boolean);

const tierKey = valueFrom(props.tier).toLowerCase() || 'starter';
const tierInfo = (config.tiers && (config.tiers[tierKey] || config.tiers.starter)) || {
  name: titleCase(tierKey) || 'Starter',
  monthlyPrice: 0,
  setupFee: 0,
};

const rawPainSources = [
  valueFrom(props.deal_pain_points),
  valueFrom(props.painPoints),
  valueFrom(props.pain_point_summary),
].filter(Boolean);

const uniquePainSources = [...new Set(rawPainSources)];
const painPoints = uniquePainSources.join('\n\n');
const contactFirstName = valueFrom(props.contact_firstname, props.firstName, props.firstname);
const contactLastName = valueFrom(props.contact_lastname, props.lastName, props.lastname);
const contactName = cleanDashes([contactFirstName, contactLastName].filter(Boolean).join(' '));

const companyName = valueFrom(
  props.company,
  props.company_name,
  props.business_name,
  props.dealname,
  props.name,
);

const companyDisplay = (() => {
  const c = String(companyName || '').trim();
  if (c && c.toUpperCase() !== 'UNKNOWN') return cleanDashes(c);
  const m = valueFrom(merged.company, merged.business_name, merged.company_name);
  if (m && String(m).trim().toUpperCase() !== 'UNKNOWN') return cleanDashes(m);
  const dn = valueFrom(props.dealname, props.name);
  if (dn) {
    const short = dn.split(/\s*[–\u2013\u2014-]\s*/)[0].trim();
    return cleanDashes(short || dn);
  }
  return '';
})();

const industryDisplay = cleanDashes(
  valueFrom(props.industry, merged.industry, merged.website_intake_industry),
);

const contactEmailDisplay = cleanDashes(
  valueFrom(merged.email, merged.contact_email, props.contact_email, props.email),
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
      rawPainPoints: valueFrom(props.deal_pain_points, painPoints),
      dealValue: tierAmount,
      amountLabel: valueFrom(props.amount),
      tierAmount,
      dealAmount: dealAmountForDisplay,
      lineItemsSubtotal,
      totalDiscount,
      tier: tierKey,
      tierLabel: tierInfo.name || titleCase(tierKey) || 'Starter',
      tierMonthly,
      monthlyCost: tierMonthly,
      upfrontDue,
      remainingTierBalance,
      launchBalance,
      finalDueAtPreLaunch: launchBalance,
      dealId: valueFrom(body.id, inner.id, deal.dealId, deal.id, body.dealId),
      contactEmail: valueFrom(props.contact_email, props.email),
      contactEmailDisplay,
      contactPhone: valueFrom(props.contact_phone, props.phone, props.mobilephone),
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
        merged.website,
        merged.company_website,
        merged.hs_website,
      ),
      driveFolderId: valueFrom(props.client_drive_folder_id),
      lineItems,
      lineItemsTotal: lineItemsSubtotal,
      productList,
      config,
    },
  },
];
