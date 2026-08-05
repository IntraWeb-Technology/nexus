import { ApplicationError } from '../../../../utils/lifecycle-helpers';

/**
 * `Site.key` is the stable `SiteKey` identifier from
 * docs/strapi-migration/contracts.md ("personal" | "intraweb"). Frontend
 * apps and the shared `strapi-client` package hardcode this value, so it
 * must never change once a Site has been created.
 */
export default {
  async beforeUpdate(event: { params: { where: Record<string, unknown>; data: Record<string, unknown> } }) {
    const { params } = event;
    if (!Object.prototype.hasOwnProperty.call(params.data ?? {}, 'key')) return;

    const existing = await strapi.db.query('api::site.site').findOne({ where: params.where });
    if (existing && existing.key !== params.data.key) {
      throw new ApplicationError(
        `Site.key is immutable once created (attempted to change "${existing.key}" to "${params.data.key}").`
      );
    }
  },
};
