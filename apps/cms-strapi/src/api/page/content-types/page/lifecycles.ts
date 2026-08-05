import { ApplicationError, extractRelationId } from '../../../../utils/lifecycle-helpers';

type PageRow = { id: number | string; documentId?: string; site?: number | string; slug?: string };

/**
 * Enforces the compound-unique `(site, slug)` rule from
 * docs/strapi-migration/content-model.md. `site` is a many-to-one
 * relation stored as a plain FK column, so it can be queried directly at
 * the db-query layer.
 *
 * Draft & Publish caveat: a single logical Page has separate draft and
 * published rows sharing one `documentId`. We resolve the row's
 * `documentId` (or the pre-update row, for updates) so that publishing an
 * entry is never flagged as colliding with its own draft.
 */
export default {
  async beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    await assertUniqueSlug({
      site: extractRelationId(data?.site),
      slug: data?.slug,
      documentId: data?.documentId,
    });
  },

  async beforeUpdate(event: { params: { where: Record<string, unknown>; data: Record<string, any> } }) {
    const { params } = event;
    const current: PageRow | null = params.where
      ? await strapi.db.query('api::page.page').findOne({ where: params.where })
      : null;

    const site = extractRelationId(params.data?.site) ?? current?.site;
    const slug = params.data?.slug ?? current?.slug;

    await assertUniqueSlug({
      site,
      slug,
      documentId: current?.documentId,
      excludeId: current?.id,
    });
  },
};

async function assertUniqueSlug({
  site,
  slug,
  documentId,
  excludeId,
}: {
  site?: number | string;
  slug?: string;
  documentId?: string;
  excludeId?: number | string;
}) {
  if (!site || !slug) return;

  const matches: PageRow[] = await strapi.db.query('api::page.page').findMany({ where: { site, slug } });
  const conflict = matches.find((entry) => {
    if (documentId && entry.documentId === documentId) return false;
    if (excludeId !== undefined && entry.id === excludeId) return false;
    return true;
  });

  if (conflict) {
    throw new ApplicationError(`A Page with slug "${slug}" already exists for this Site.`);
  }
}
