import { ApplicationError, extractRelationIds, idsOverlap } from '../../../../utils/lifecycle-helpers';

const UID = 'api::article.article' as const;

type ArticleRow = {
  id: number | string;
  documentId?: string;
  slug?: string;
  sites?: Array<{ id: number | string }>;
};

/**
 * Best-effort slug uniqueness *per Site* for Article (many-to-many
 * `sites`). "Unique per site" means: no other Article document may share
 * both this slug and at least one Site in common.
 *
 * This cannot be a hard DB constraint because `sites` is a join table.
 * Caveats:
 *  - The Document Service issues relation writes as `{ connect, disconnect }`
 *    (or `{ set }`) mutations at a layer above these row-level lifecycles.
 *    When the incoming payload doesn't touch `sites`, we fall back to the
 *    entry's already-persisted relations (fetched via `db.query` with
 *    `populate`) to evaluate overlap — this misses the case where a
 *    `connect`/`disconnect` pair is sent in the same request as a slug
 *    change, which we treat as acceptable for a best-effort check.
 *  - Draft/published rows of the same document share one `documentId`;
 *    we exclude same-`documentId` rows so publishing never collides with
 *    its own draft.
 */
export default {
  async beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    await assertUniqueSlugPerSite({
      slug: data?.slug,
      siteIds: extractRelationIds(data?.sites),
      documentId: data?.documentId,
    });
  },

  async beforeUpdate(event: { params: { where: Record<string, unknown>; data: Record<string, any> } }) {
    const { params } = event;
    const current: ArticleRow | null = params.where
      ? await strapi.db.query(UID).findOne({ where: params.where, populate: { sites: true } })
      : null;

    const slug = params.data?.slug ?? current?.slug;
    const siteIds =
      params.data?.sites !== undefined
        ? extractRelationIds(params.data.sites)
        : (current?.sites ?? []).map((s) => s.id);

    await assertUniqueSlugPerSite({
      slug,
      siteIds,
      documentId: current?.documentId,
      excludeId: current?.id,
    });
  },
};

async function assertUniqueSlugPerSite({
  slug,
  siteIds,
  documentId,
  excludeId,
}: {
  slug?: string;
  siteIds: Array<number | string>;
  documentId?: string;
  excludeId?: number | string;
}) {
  if (!slug || siteIds.length === 0) return;

  const matches: ArticleRow[] = await strapi.db.query(UID).findMany({
    where: { slug },
    populate: { sites: true },
  });

  const conflict = matches.find((entry) => {
    if (documentId && entry.documentId === documentId) return false;
    if (excludeId !== undefined && entry.id === excludeId) return false;
    const entrySiteIds = (entry.sites ?? []).map((s) => s.id);
    return idsOverlap(entrySiteIds, siteIds);
  });

  if (conflict) {
    throw new ApplicationError(`Another Article already uses slug "${slug}" on one of the selected Sites.`);
  }
}
