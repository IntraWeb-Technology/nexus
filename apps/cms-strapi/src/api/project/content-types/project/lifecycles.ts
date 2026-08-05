import { ApplicationError, extractRelationIds, idsOverlap } from '../../../../utils/lifecycle-helpers';

const UID = 'api::project.project' as const;

type ProjectRow = {
  id: number | string;
  documentId?: string;
  slug?: string;
  sites?: Array<{ id: number | string }>;
};

/**
 * Best-effort slug uniqueness *per Site* for Project (many-to-many
 * `sites`). See `article/content-types/article/lifecycles.ts` for the
 * full rationale and caveats — identical shape, different content type.
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
    const current: ProjectRow | null = params.where
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

  const matches: ProjectRow[] = await strapi.db.query(UID).findMany({
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
    throw new ApplicationError(`Another Project already uses slug "${slug}" on one of the selected Sites.`);
  }
}
