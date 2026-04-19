#!/usr/bin/env node
/**
 * Load HUBSPOT_ACCESS_TOKEN (or HUBSPOT_TOKEN) from apps/iw-site/.env.local,
 * ensure deal exists, set Website Project enum project_type to "website".
 *
 * Usage:
 *   node scripts/hubspot-bootstrap-website-project-deal.mjs [dealId]
 *
 * Deal property group + fields must exist (see create-hubspot-website-properties.js);
 * that script needs crm.schemas.deals.write on the private app.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const root = path.join(__dirname, "..");
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const token = (
  process.env.HUBSPOT_TOKEN?.trim() ||
  process.env.HUBSPOT_ACCESS_TOKEN?.trim() ||
  ""
).trim();

const dealId = (process.argv[2] || "320346410735").trim();

if (!token) {
  console.error("Missing HUBSPOT_ACCESS_TOKEN or HUBSPOT_TOKEN in .env.local / .env");
  process.exit(1);
}

const base = "https://api.hubapi.com";

async function main() {
  const getRes = await fetch(
    `${base}/crm/v3/objects/deals/${encodeURIComponent(dealId)}?properties=dealname,project_type`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const getText = await getRes.text();
  if (!getRes.ok) {
    console.error(`GET deal ${dealId} failed HTTP ${getRes.status}:`, getText.slice(0, 600));
    process.exit(1);
  }
  const deal = JSON.parse(getText);
  const name = deal.properties?.dealname ?? "(no name)";
  console.log(`Deal ${dealId}: ${name}`);
  console.log(`Current project_type: ${deal.properties?.project_type ?? "(unset)"}`);

  const patchRes = await fetch(`${base}/crm/v3/objects/deals/${encodeURIComponent(dealId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        project_type: "website",
      },
    }),
  });
  const patchText = await patchRes.text();
  if (!patchRes.ok) {
    console.error(`PATCH deal failed HTTP ${patchRes.status}:`, patchText.slice(0, 800));
    console.error(
      "If project_type is unknown, create deal properties with node scripts/create-hubspot-website-properties.js (private app needs crm.schemas.deals.write).",
    );
    process.exit(1);
  }
  console.log("OK: project_type set to website (Website Project intake ready on this deal).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
