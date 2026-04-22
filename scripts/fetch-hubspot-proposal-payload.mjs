#!/usr/bin/env node
/**
 * Build a JSON body for n8n SYS 03 — Proposal and Contract Delivery
 * (POST /webhook/hubspot-deal-proposal-stage): `{ id, properties }`.
 *
 * Loads token from repo root / apps/iw-portal / apps/iw-site .env.local (first wins for unset keys).
 *
 * Usage:
 *   node scripts/fetch-hubspot-proposal-payload.mjs
 *   node scripts/fetch-hubspot-proposal-payload.mjs <hubspotContactId>
 *   node scripts/fetch-hubspot-proposal-payload.mjs <hubspotContactId> <dealId>
 *   node scripts/fetch-hubspot-proposal-payload.mjs --deal=<hubspotDealId>
 *     (loads deal first, then merges website intake from associated contacts)
 *
 * Note: `HUBSPOT_PORTAL_ID` is your portal/account numeric id, not a contact id. If you only have an email,
 * run with no args and set PROPOSAL_LOOKUP_EMAIL, or pass a real `hs_object_id` from the contact record.
 *
 * Env:
 *   HUBSPOT_PRIVATE_APP_TOKEN | HUBSPOT_ACCESS_TOKEN | HUBSPOT_TOKEN (required)
 *   PROPOSAL_EMAIL_OVERRIDE — value written to deal `contact_email` for SYS 03 (default: jschibelli@gmail.com)
 *   PROPOSAL_LOOKUP_EMAIL — when no contact id arg, or id GET returns 404, search HubSpot contact by this email
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

/** Same internal names as apps/iw-site/lib/mapWebsiteIntakeToHubSpotContactProperties.ts */
const WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES = [
  "website_intake_audience",
  "website_intake_brand_colors",
  "website_intake_budget_notes",
  "website_intake_budget_range",
  "website_intake_business_description",
  "website_intake_cms",
  "website_intake_competitors",
  "website_intake_copywriter",
  "website_intake_design_notes",
  "website_intake_differentiator",
  "website_intake_dislike_about",
  "website_intake_dont_want",
  "website_intake_features",
  "website_intake_final_notes",
  "website_intake_font_style",
  "website_intake_funding",
  "website_intake_goal_detail",
  "website_intake_goals",
  "website_intake_hard_deadline",
  "website_intake_has_logo",
  "website_intake_has_photos",
  "website_intake_industry",
  "website_intake_inspiration_sites",
  "website_intake_like_about",
  "website_intake_location",
  "website_intake_ongoing_support",
  "website_intake_other_pages",
  "website_intake_pages",
  "website_intake_payment",
  "website_intake_timeline",
  "website_intake_vibe",
];

/** SYS 00 — HubSpot Events Router `dealProps` + useful extras */
const DEAL_READ_PROPERTIES = [
  "dealname",
  "dealstage",
  "amount",
  "closedate",
  "tier",
  "contact_email",
  "contact_firstname",
  "contact_lastname",
  "contact_phone",
  "industry",
  "deal_pain_points",
  "client_drive_folder_id",
  "monthly_retainer",
  "client_health_score",
  "company",
  "hs_line_items",
  "description",
  "pipeline",
  "hs_lastmodifieddate",
  "website",
  "domain",
  "business_name",
];

const CORE_CONTACT_PROPERTIES = [
  "firstname",
  "lastname",
  "email",
  "company",
  "phone",
  "mobilephone",
  "website",
  "pain_point",
  "website_intake_details",
  "website_intake_json",
  "industry",
  "jobtitle",
  "city",
  "state",
  "zip",
  "country",
  "address",
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function hubspotPlainProperty() {
  return (
    process.env.HUBSPOT_WEBSITE_INTAKE_PLAIN_PROPERTY?.trim() || "website_intake_details"
  );
}

function hubspotJsonProperty() {
  return process.env.HUBSPOT_WEBSITE_INTAKE_JSON_PROPERTY?.trim() || "website_intake_json";
}

loadEnvFile(path.join(repoRoot, ".env.local"));
loadEnvFile(path.join(repoRoot, ".env"));
loadEnvFile(path.join(repoRoot, "apps", "iw-portal", ".env.local"));
loadEnvFile(path.join(repoRoot, "apps", "iw-site", ".env.local"));

const token = (
  process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim() ||
  process.env.HUBSPOT_ACCESS_TOKEN?.trim() ||
  process.env.HUBSPOT_TOKEN?.trim() ||
  ""
).trim();

function parseDealFlag() {
  for (const a of process.argv.slice(2)) {
    const m = /^--deal=(.+)$/.exec(a);
    if (m) return m[1].trim();
  }
  return "";
}

const dealFlag = parseDealFlag();
const argvPositional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const argv2 = argvPositional[0]?.trim();
const argv3 = argvPositional[1]?.trim();
/** HubSpot contact `hs_object_id` (not portal id). */
const contactIdArg = !dealFlag && argv2 ? argv2 : "";
const dealIdArg = dealFlag || (argv3 && !argv3.startsWith("-") ? argv3 : "");
const emailOverride = (
  process.env.PROPOSAL_EMAIL_OVERRIDE?.trim() || "jschibelli@gmail.com"
).trim();
const lookupEmail = (
  process.env.PROPOSAL_LOOKUP_EMAIL?.trim() || emailOverride
).trim();

const base = "https://api.hubapi.com";

async function hsGet(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { res, json, text };
}

async function fetchContactProperties(cid, contactPropsList) {
  const props = [...contactPropsList].join(",");
  const url = `${base}/crm/v3/objects/contacts/${encodeURIComponent(cid)}?properties=${encodeURIComponent(props)}`;
  const { res, json, text } = await hsGet(url);
  if (!res.ok) {
    const err = new Error(`GET contact ${cid} failed HTTP ${res.status}: ${text.slice(0, 800)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function searchContactByEmail(email, contactPropsList) {
  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "email",
            operator: "EQ",
            value: email,
          },
        ],
      },
    ],
    properties: contactPropsList,
    limit: 5,
  };
  const res = await fetch(`${base}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new Error(`Contact search failed HTTP ${res.status}: ${text.slice(0, 800)}`);
  }
  const results = Array.isArray(json.results) ? json.results : [];
  return results;
}

async function fetchContactWithFallback(resolvedContactId) {
  const plainProp = hubspotPlainProperty();
  const jsonProp = hubspotJsonProperty();
  const fullList = [
    ...new Set([
      ...CORE_CONTACT_PROPERTIES.filter((p) => p !== "website_intake_details" && p !== "website_intake_json"),
      plainProp,
      jsonProp,
      ...WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES,
    ]),
  ];
  try {
    return await fetchContactProperties(resolvedContactId, fullList);
  } catch (e) {
    if (e.status === 400) {
      console.warn(
        "[fetch-hubspot-proposal-payload] Full contact property set rejected; retrying core + intake plain/json only.",
      );
      const minimal = [
        ...CORE_CONTACT_PROPERTIES.filter((p) => p !== "website_intake_details" && p !== "website_intake_json"),
        plainProp,
        jsonProp,
      ];
      return await fetchContactProperties(resolvedContactId, minimal);
    }
    throw e;
  }
}

async function fetchContactIdsForDeal(dealId) {
  const url = `${base}/crm/v4/objects/deals/${encodeURIComponent(dealId)}/associations/contacts?limit=500`;
  const { res, json } = await hsGet(url);
  if (!res.ok) return [];
  const results = Array.isArray(json.results) ? json.results : [];
  const ids = [];
  for (const r of results) {
    const id = r.toObjectId != null ? String(r.toObjectId) : r.id != null ? String(r.id) : "";
    if (id) ids.push(id);
  }
  return [...new Set(ids)];
}

async function fetchDealIdsForContact(resolvedContactId) {
  const url = `${base}/crm/v4/objects/contacts/${encodeURIComponent(resolvedContactId)}/associations/deals?limit=500`;
  const { res, json } = await hsGet(url);
  if (!res.ok) return [];
  const results = Array.isArray(json.results) ? json.results : [];
  const ids = [];
  for (const r of results) {
    const id = r.toObjectId != null ? String(r.toObjectId) : r.id != null ? String(r.id) : "";
    if (id) ids.push(id);
  }
  return [...new Set(ids)];
}

/** When v4 associations are empty (label mismatch, etc.), find deals linked to this contact via CRM search. */
async function searchDealIdsByAssociatedContact(resolvedContactId) {
  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "associations.contact",
            operator: "EQ",
            value: resolvedContactId,
          },
        ],
      },
    ],
    properties: ["dealname", "hs_lastmodifieddate"],
    limit: 50,
  };
  const res = await fetch(`${base}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const results = Array.isArray(json.results) ? json.results : [];
  return results.map((r) => String(r.id)).filter(Boolean);
}

async function searchDealIdsByContactEmail(email) {
  if (!email) return [];
  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "contact_email",
            operator: "EQ",
            value: email,
          },
        ],
      },
    ],
    properties: ["dealname", "hs_lastmodifieddate", "contact_email"],
    limit: 50,
  };
  const res = await fetch(`${base}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const results = Array.isArray(json.results) ? json.results : [];
  return results.map((r) => String(r.id)).filter(Boolean);
}

async function fetchDeal(dealId) {
  const props = DEAL_READ_PROPERTIES.join(",");
  const url = `${base}/crm/v3/objects/deals/${encodeURIComponent(dealId)}?properties=${encodeURIComponent(props)}`;
  const { res, json, text } = await hsGet(url);
  if (!res.ok) {
    throw new Error(`GET deal ${dealId} failed HTTP ${res.status}: ${text.slice(0, 800)}`);
  }
  return json;
}

function nonEmptyProps(obj) {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) out[k] = s;
  }
  return out;
}

/** HubSpot returns explicit `null` for empty properties; strip for cleaner n8n payloads. */
function dropNullProps(obj) {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (out[k] === null || out[k] === undefined) delete out[k];
  }
  return out;
}

function titleFromSnake(name) {
  return name
    .replace(/^website_intake_/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatWebsiteIntakeBlock(contactProps) {
  const lines = [];
  for (const key of WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES) {
    const v = contactProps[key];
    if (v === undefined || v === null || !String(v).trim()) continue;
    lines.push(`${titleFromSnake(key)}: ${String(v).trim()}`);
  }
  return lines.join("\n");
}

function buildPainMerge({ dealProps, contactProps }) {
  const parts = [];
  const dp = (dealProps.deal_pain_points || "").trim();
  if (dp) parts.push(dp);
  const pp = (contactProps.pain_point || "").trim();
  if (pp) parts.push(`Contact pain_point:\n${pp}`);
  const plainProp = hubspotPlainProperty();
  const plain = (contactProps[plainProp] || "").trim();
  if (plain) parts.push(`Website intake (plain):\n${plain}`);
  const jsonProp = hubspotJsonProperty();
  const rawJson = (contactProps[jsonProp] || "").trim();
  if (rawJson) {
    let pretty = rawJson;
    try {
      pretty = JSON.stringify(JSON.parse(rawJson), null, 2);
    } catch {
      /* keep raw */
    }
    parts.push(`Website intake (JSON):\n${pretty}`);
  }
  const intakeBlock = formatWebsiteIntakeBlock(contactProps);
  if (intakeBlock) parts.push(`Website intake (structured fields):\n${intakeBlock}`);
  return parts.filter(Boolean).join("\n\n---\n\n");
}

function pickLatestDealId(dealRecords) {
  let best = null;
  let bestTs = 0;
  for (const d of dealRecords) {
    const raw = d.properties?.hs_lastmodifieddate;
    const t = raw ? Date.parse(raw) : 0;
    if (!best || t >= bestTs) {
      best = d;
      bestTs = t || bestTs;
    }
  }
  return best?.id ? String(best.id) : null;
}

async function main() {
  if (!token) {
    console.error(
      "Missing HUBSPOT_PRIVATE_APP_TOKEN, HUBSPOT_ACCESS_TOKEN, or HUBSPOT_TOKEN in environment / .env.local",
    );
    process.exit(1);
  }

  /** Deal-first: `--deal=id` loads deal + associated contacts for intake merge. */
  if (dealFlag) {
    const deal = await fetchDeal(dealFlag);
    const dealProps = { ...(deal.properties || {}) };
    const assocContactIds = await fetchContactIdsForDeal(String(deal.id));
    let mergedContactProps = {};
    for (const cid of assocContactIds) {
      try {
        const c = await fetchContactWithFallback(cid);
        mergedContactProps = { ...mergedContactProps, ...(c.properties || {}) };
      } catch {
        /* skip */
      }
    }
    const mergedPain = buildPainMerge({
      dealProps,
      contactProps: mergedContactProps,
    });
    if (mergedPain) dealProps.deal_pain_points = mergedPain;
    if (!String(dealProps.contact_firstname || "").trim() && mergedContactProps.firstname) {
      dealProps.contact_firstname = String(mergedContactProps.firstname).trim();
    }
    if (!String(dealProps.contact_lastname || "").trim() && mergedContactProps.lastname) {
      dealProps.contact_lastname = String(mergedContactProps.lastname).trim();
    }
    if (!String(dealProps.contact_phone || "").trim()) {
      const ph = (mergedContactProps.phone || mergedContactProps.mobilephone || "").trim();
      if (ph) dealProps.contact_phone = ph;
    }
    if (!String(dealProps.industry || "").trim() && mergedContactProps.industry) {
      dealProps.industry = String(mergedContactProps.industry).trim();
    }
    if (!String(dealProps.company || "").trim() && mergedContactProps.company) {
      dealProps.company = String(mergedContactProps.company).trim();
    }
    if (!String(dealProps.website || "").trim() && mergedContactProps.website) {
      dealProps.website = String(mergedContactProps.website).trim();
    }
    dealProps.contact_email = emailOverride;

    const webhookBody = {
      id: String(deal.id),
      properties: dropNullProps(dealProps),
    };

    const envelope = {
      description:
        "POST webhookBody as JSON to n8n path hubspot-deal-proposal-stage (same shape SYS 00 forwards).",
      mode: "deal-first",
      dealId: String(deal.id),
      associatedContactIds: assocContactIds,
      proposalEmailOverride: emailOverride,
      webhookBody,
      source: {
        deal: {
          id: String(deal.id),
          properties: nonEmptyProps(deal.properties || {}),
        },
        contactsMerged: nonEmptyProps(mergedContactProps),
      },
    };

    const outDir = path.join(repoRoot, "tmp");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `proposal-payload-deal-${deal.id}.json`);
    fs.writeFileSync(outFile, JSON.stringify(envelope, null, 2), "utf8");
    console.log(`Wrote ${outFile}`);
    console.log("");
    console.log("webhookBody (POST this JSON body to n8n):");
    console.log(JSON.stringify(webhookBody, null, 2));
    return;
  }

  const portalId = (process.env.HUBSPOT_PORTAL_ID || "").trim();
  let resolvedContactId = contactIdArg;

  if (resolvedContactId && portalId && resolvedContactId === portalId) {
    console.warn(
      `[fetch-hubspot-proposal-payload] Argument "${resolvedContactId}" matches HUBSPOT_PORTAL_ID (account id), not a contact id. ` +
        `Resolving contact via PROPOSAL_LOOKUP_EMAIL (${lookupEmail}).`,
    );
    resolvedContactId = "";
  }

  let contact;
  if (resolvedContactId) {
    try {
      contact = await fetchContactWithFallback(resolvedContactId);
    } catch (e) {
      if (e.status === 404) {
        console.warn(
          `[fetch-hubspot-proposal-payload] Contact id not found (${resolvedContactId}). Trying PROPOSAL_LOOKUP_EMAIL (${lookupEmail}).`,
        );
        const plainProp = hubspotPlainProperty();
        const jsonProp = hubspotJsonProperty();
        const searchProps = [
          ...new Set([
            ...CORE_CONTACT_PROPERTIES.filter(
              (p) => p !== "website_intake_details" && p !== "website_intake_json",
            ),
            plainProp,
            jsonProp,
            ...WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES,
          ]),
        ];
        const hits = await searchContactByEmail(lookupEmail, searchProps);
        if (!hits.length) {
          throw e;
        }
        contact = hits[0];
        resolvedContactId = String(contact.id);
        console.warn(`[fetch-hubspot-proposal-payload] Using contact id ${resolvedContactId} from email search.`);
      } else {
        throw e;
      }
    }
  } else {
    const plainProp = hubspotPlainProperty();
    const jsonProp = hubspotJsonProperty();
    const searchProps = [
      ...new Set([
        ...CORE_CONTACT_PROPERTIES.filter(
          (p) => p !== "website_intake_details" && p !== "website_intake_json",
        ),
        plainProp,
        jsonProp,
        ...WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES,
      ]),
    ];
    const hits = await searchContactByEmail(lookupEmail, searchProps);
    if (!hits.length) {
      console.error(
        `No contact found with email ${lookupEmail}. Set PROPOSAL_LOOKUP_EMAIL or pass a HubSpot contact id (hs_object_id).`,
      );
      process.exit(1);
    }
    contact = hits[0];
    resolvedContactId = String(contact.id);
    console.warn(`[fetch-hubspot-proposal-payload] Using contact id ${resolvedContactId} from PROPOSAL_LOOKUP_EMAIL.`);
  }

  const contactProps = contact.properties || {};

  let dealId = dealIdArg;
  let dealIds = dealId ? [dealId] : await fetchDealIdsForContact(resolvedContactId);
  if (!dealId && dealIds.length === 0) {
    dealIds = await searchDealIdsByAssociatedContact(resolvedContactId);
  }
  if (!dealId && dealIds.length === 0) {
    const ce = (contactProps.email || "").trim();
    dealIds = await searchDealIdsByContactEmail(ce);
  }
  if (!dealId && dealIds.length === 0) {
    console.error(
      `No deals found for contact ${resolvedContactId} (associations + search). Create/associate a deal, or pass dealId:\n` +
        `  node scripts/fetch-hubspot-proposal-payload.mjs ${resolvedContactId} <dealId>`,
    );
    process.exit(1);
  }

  if (!dealId) {
    const reads = await Promise.all(dealIds.map((id) => fetchDeal(id)));
    dealId = pickLatestDealId(reads) || dealIds[0];
  }

  const deal = await fetchDeal(dealId);
  const dealProps = { ...(deal.properties || {}) };

  const mergedPain = buildPainMerge({ dealProps, contactProps });
  if (mergedPain) dealProps.deal_pain_points = mergedPain;

  if (!String(dealProps.contact_firstname || "").trim() && contactProps.firstname) {
    dealProps.contact_firstname = String(contactProps.firstname).trim();
  }
  if (!String(dealProps.contact_lastname || "").trim() && contactProps.lastname) {
    dealProps.contact_lastname = String(contactProps.lastname).trim();
  }
  if (!String(dealProps.contact_phone || "").trim()) {
    const ph = (contactProps.phone || contactProps.mobilephone || "").trim();
    if (ph) dealProps.contact_phone = ph;
  }
  if (!String(dealProps.industry || "").trim() && contactProps.industry) {
    dealProps.industry = String(contactProps.industry).trim();
  }
  if (!String(dealProps.company || "").trim() && contactProps.company) {
    dealProps.company = String(contactProps.company).trim();
  }
  if (!String(dealProps.website || "").trim() && contactProps.website) {
    dealProps.website = String(contactProps.website).trim();
  }

  dealProps.contact_email = emailOverride;

  const webhookBody = {
    id: String(deal.id),
    properties: dropNullProps(dealProps),
  };

  const envelope = {
    description:
      "POST this object as JSON to n8n webhook path hubspot-deal-proposal-stage (same shape SYS 00 forwards).",
    contactId: resolvedContactId,
    dealId: String(deal.id),
    proposalEmailOverride: emailOverride,
    webhookBody,
    /** Full HubSpot reads for audit / re-merge */
    source: {
      contact: {
        id: String(contact.id),
        properties: nonEmptyProps(contactProps),
        archived: contact.archived,
      },
      deal: {
        id: String(deal.id),
        properties: nonEmptyProps(deal.properties || {}),
        archived: deal.archived,
      },
    },
  };

  const outDir = path.join(repoRoot, "tmp");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `proposal-payload-contact-${resolvedContactId}-deal-${dealId}.json`);
  fs.writeFileSync(outFile, JSON.stringify(envelope, null, 2), "utf8");

  console.log(`Wrote ${outFile}`);
  console.log("");
  console.log("webhookBody (POST this JSON body to n8n):");
  console.log(JSON.stringify(webhookBody, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
