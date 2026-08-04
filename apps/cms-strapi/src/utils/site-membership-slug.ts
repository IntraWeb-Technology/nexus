import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { normalizeSlug } from './slug';
import { excludeCurrentId, resolveRelationIds } from './uniqueness';

const { ApplicationError } = errors;

type SiteMembershipUid =
  | 'api::article.article'
  | 'api::project.project'
  | 'api::case-study.case-study';

type LifecycleEvent = {
  params: {
    data?: Record<string, unknown>;
    where?: { id?: number | string };
  };
};

export async function assertPublishedSlugUniquePerSite(
  strapi: Core.Strapi,
  uid: SiteMembershipUid,
  data: Record<string, unknown>,
  currentId?: number | string | null
): Promise<void> {
  if (typeof data.slug === 'string') {
    data.slug = normalizeSlug(data.slug);
  }

  const slug = typeof data.slug === 'string' ? data.slug : null;
  if (!slug) {
    return;
  }

  let siteIds = resolveRelationIds(data.sites);

  if (siteIds.length === 0 && currentId != null) {
    const existing = await strapi.db.query(uid).findOne({
      where: { id: currentId },
      populate: { sites: { select: ['id'] } },
    });
    siteIds = (existing?.sites ?? []).map((site: { id: number }) => site.id);
  }

  if (siteIds.length === 0) {
    return;
  }

  for (const siteId of siteIds) {
    const conflict = await strapi.db.query(uid).findOne({
      where: excludeCurrentId(
        {
          slug,
          sites: { id: siteId },
          publishedAt: { $notNull: true },
        },
        currentId
      ),
      select: ['id'],
    });

    if (conflict) {
      throw new ApplicationError(
        `A published entry already uses slug "${slug}" on the same site.`
      );
    }
  }
}

export async function hydrateSlugAndSites(
  strapi: Core.Strapi,
  uid: SiteMembershipUid,
  event: LifecycleEvent
): Promise<{ data: Record<string, unknown>; currentId?: number | string }> {
  const data = event.params.data ?? {};
  const currentId = event.params.where?.id;

  if (data.slug == null && currentId != null) {
    const existing = await strapi.db.query(uid).findOne({
      where: { id: currentId },
      select: ['slug'],
    });
    if (existing?.slug) {
      data.slug = existing.slug;
    }
  }

  return { data, currentId };
}
