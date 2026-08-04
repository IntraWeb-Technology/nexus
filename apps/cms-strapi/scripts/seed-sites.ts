/**
 * Seed Site entries for personal + intraweb.
 *
 * Usage (from apps/cms-strapi):
 *   npx tsx scripts/seed-sites.ts --dry-run
 *   npx tsx scripts/seed-sites.ts
 *
 * Requires a running Strapi instance with admin/API access via STRAPI_URL
 * and STRAPI_API_TOKEN (Content API token with Site create permission),
 * OR run inside `strapi console` / bootstrap.
 *
 * This script uses the Document Service via a short-lived Strapi instance
 * when STRAPI_SEED_EMBEDDED=true; otherwise it calls the REST API.
 */

import { createRequire } from 'module';
import path from 'path';

const SITES = [
  {
    key: 'personal',
    name: 'Personal portfolio',
    domain: 'johnschibelli.dev',
    description: 'Personal portfolio and blog',
    status: 'active',
    defaultLocale: 'en',
  },
  {
    key: 'intraweb',
    name: 'IntraWeb Technology',
    domain: 'intrawebtech.com',
    description: 'IntraWeb Technology marketing site',
    status: 'active',
    defaultLocale: 'en',
  },
] as const;

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function seedViaRest(dryRun: boolean) {
  const baseUrl = (process.env.STRAPI_URL ?? 'http://127.0.0.1:1337').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN;

  if (!token && !dryRun) {
    throw new Error('STRAPI_API_TOKEN is required unless --dry-run is set.');
  }

  for (const site of SITES) {
    console.log(`${dryRun ? '[dry-run] would upsert' : 'upserting'} site key=${site.key}`);

    if (dryRun) {
      continue;
    }

    const listRes = await fetch(
      `${baseUrl}/api/sites?filters[key][$eq]=${encodeURIComponent(site.key)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!listRes.ok) {
      throw new Error(`Failed listing sites: ${listRes.status} ${await listRes.text()}`);
    }

    const listJson = (await listRes.json()) as { data?: unknown[] };
    const existing = Array.isArray(listJson.data) ? listJson.data[0] : null;

    if (existing) {
      console.log(`  exists — skipped (${site.key})`);
      continue;
    }

    const createRes = await fetch(`${baseUrl}/api/sites`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: site }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed creating site ${site.key}: ${createRes.status} ${await createRes.text()}`);
    }

    console.log(`  created ${site.key}`);
  }
}

async function seedEmbedded(dryRun: boolean) {
  // Dynamic require keeps this script optional for environments without a full build.
  const require = createRequire(__filename);
  const appDir = path.resolve(__dirname, '..');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createStrapi } = require('@strapi/strapi');

  const app = await createStrapi({ appDir, distDir: path.join(appDir, 'dist') }).load();

  try {
    for (const site of SITES) {
      console.log(`${dryRun ? '[dry-run] would upsert' : 'upserting'} site key=${site.key}`);

      const existing = await app.db.query('api::site.site').findOne({
        where: { key: site.key },
        select: ['id', 'key'],
      });

      if (existing) {
        console.log(`  exists — skipped (${site.key})`);
        continue;
      }

      if (dryRun) {
        continue;
      }

      await app.documents('api::site.site').create({ data: { ...site } });
      console.log(`  created ${site.key}`);
    }
  } finally {
    await app.destroy();
  }
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  const embedded = process.env.STRAPI_SEED_EMBEDDED === 'true' || hasFlag('--embedded');

  console.log(`seed-sites dryRun=${dryRun} mode=${embedded ? 'embedded' : 'rest'}`);

  if (embedded) {
    await seedEmbedded(dryRun);
  } else {
    await seedViaRest(dryRun);
  }

  console.log('done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
