import type { Core } from '@strapi/strapi';

/**
 * Site keys frozen in docs/strapi-migration/contracts.md. Do not add or
 * rename entries here without updating the contract and every consumer
 * (frontend apps, `packages/strapi-client`).
 */
const REQUIRED_SITES = [
  { key: 'personal', name: 'Personal Portfolio', domain: 'johnschibelli.dev', status: 'active' as const },
  { key: 'intraweb', name: 'IntraWeb Technology', domain: 'intrawebtech.com', status: 'active' as const },
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedRequiredSites(strapi);
  },
};

/**
 * Idempotently ensures the contract-defined Sites exist. Safe to run on
 * every boot (dev and prod): only inserts rows for missing `key`s and
 * never mutates existing ones — `Site.key` is immutable post-create per
 * the `site` content-type lifecycle.
 */
async function seedRequiredSites(strapi: Core.Strapi) {
  for (const site of REQUIRED_SITES) {
    const existing = await strapi.db.query('api::site.site').findOne({ where: { key: site.key } });
    if (existing) continue;

    await strapi.db.query('api::site.site').create({ data: site });
    strapi.log.info(`[bootstrap] Created Site "${site.key}" (${site.domain}).`);
  }
}
