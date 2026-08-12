import { ApplicationError, extractRelationId } from '../../../../utils/lifecycle-helpers';

type SingletonRow = { id: number | string; documentId?: string; site?: number | string };

/**
 * Enforces "exactly one About Page entry per Site" from
 * docs/strapi-migration/content-model.md. `site` is a one-to-one
 * relation stored as a plain FK column.
 *
 * Draft & Publish caveat: a About Page document has separate draft
 * and published rows sharing one `documentId` — both point at the same
 * Site, so we exclude rows with the same `documentId` from the conflict
 * check to avoid flagging publish/draft of the same entry.
 */
export default {
  async beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    await assertSinglePerSite({ site: extractRelationId(data?.site), documentId: data?.documentId });
  },

  async beforeUpdate(event: { params: { where: Record<string, unknown>; data: Record<string, any> } }) {
    const { params } = event;
    const current: SingletonRow | null = params.where
      ? await strapi.db.query('api::about-page.about-page').findOne({ where: params.where })
      : null;

    const site = extractRelationId(params.data?.site) ?? current?.site;

    await assertSinglePerSite({
      site,
      documentId: current?.documentId,
      excludeId: current?.id,
    });
  },
};

async function assertSinglePerSite({
  site,
  documentId,
  excludeId,
}: {
  site?: number | string;
  documentId?: string;
  excludeId?: number | string;
}) {
  if (!site) return;

  const matches: SingletonRow[] = await strapi.db
    .query('api::about-page.about-page')
    .findMany({ where: { site } });

  const conflict = matches.find((entry) => {
    if (documentId && entry.documentId === documentId) return false;
    if (excludeId !== undefined && entry.id === excludeId) return false;
    return true;
  });

  if (conflict) {
    throw new ApplicationError('This Site already has a About Page entry. Only one is allowed per Site.');
  }
}
