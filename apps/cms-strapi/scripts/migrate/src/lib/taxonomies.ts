import { normalizeSlug } from "./slug";
import { createEntry, findOne, updateEntry } from "./strapiClient";
import type { RunMode, SiteKey } from "../types";

/**
 * Shared/global reference data (Site, Tag, Technology, Author) is looked up
 * and lazily created on demand, then cached for the duration of one run so
 * we never issue duplicate create calls for the same name within a batch.
 */
export class TaxonomyCache {
  private sites = new Map<SiteKey, string>();
  private tags = new Map<string, string>();
  private technologies = new Map<string, string>();
  private authors = new Map<string, string>();

  ensuredSites: SiteKey[] = [];
  createdTags = new Set<string>();
  createdTechnologies = new Set<string>();
  createdAuthors = new Set<string>();

  async ensureSite(key: SiteKey, mode: RunMode, name: string, domain: string): Promise<string> {
    if (this.sites.has(key)) return this.sites.get(key)!;
    if (mode !== "write") {
      const placeholder = `dry:site:${key}`;
      this.sites.set(key, placeholder);
      return placeholder;
    }
    const existing = await findOne("sites", { key: { $eq: key } });
    if (existing) {
      this.sites.set(key, existing.documentId);
      return existing.documentId;
    }
    const created = await createEntry("sites", { name, key, domain, status: "active" });
    this.sites.set(key, created.documentId);
    this.ensuredSites.push(key);
    return created.documentId;
  }

  getSiteId(key: SiteKey): string | undefined {
    return this.sites.get(key);
  }

  async ensureTag(name: string, mode: RunMode): Promise<string> {
    const slug = normalizeSlug(name);
    if (this.tags.has(slug)) return this.tags.get(slug)!;
    if (mode !== "write") {
      const placeholder = `dry:tag:${slug}`;
      this.tags.set(slug, placeholder);
      return placeholder;
    }
    const existing = await findOne("tags", { slug: { $eq: slug } });
    if (existing) {
      this.tags.set(slug, existing.documentId);
      return existing.documentId;
    }
    const created = await createEntry("tags", { name, slug });
    this.tags.set(slug, created.documentId);
    this.createdTags.add(slug);
    return created.documentId;
  }

  async ensureTechnology(name: string, mode: RunMode): Promise<string> {
    const slug = normalizeSlug(name);
    if (this.technologies.has(slug)) return this.technologies.get(slug)!;
    if (mode !== "write") {
      const placeholder = `dry:technology:${slug}`;
      this.technologies.set(slug, placeholder);
      return placeholder;
    }
    const existing = await findOne("technologies", { slug: { $eq: slug } });
    if (existing) {
      this.technologies.set(slug, existing.documentId);
      return existing.documentId;
    }
    const created = await createEntry("technologies", { name, slug });
    this.technologies.set(slug, created.documentId);
    this.createdTechnologies.add(slug);
    return created.documentId;
  }

  async ensureAuthor(name: string, email: string | undefined, mode: RunMode): Promise<string> {
    const key = (email || name).toLowerCase();
    if (this.authors.has(key)) return this.authors.get(key)!;
    const slug = normalizeSlug(name);
    if (mode !== "write") {
      const placeholder = `dry:author:${slug}`;
      this.authors.set(key, placeholder);
      return placeholder;
    }
    const existing = await findOne("authors", { slug: { $eq: slug } });
    if (existing) {
      this.authors.set(key, existing.documentId);
      return existing.documentId;
    }
    const payload: Record<string, unknown> = { name, slug };
    if (email) payload.email = email;
    const created = await createEntry("authors", payload);
    this.authors.set(key, created.documentId);
    this.createdAuthors.add(slug);
    return created.documentId;
  }

  async resolveManyByName(
    names: string[],
    ensure: (name: string, mode: RunMode) => Promise<string>,
    mode: RunMode
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names) {
      if (!name?.trim()) continue;
      ids.push(await ensure(name.trim(), mode));
    }
    return ids;
  }
}

export async function upsertGeneric(
  uid: string,
  findFilters: Record<string, unknown>,
  payload: Record<string, unknown>,
  mode: RunMode,
  options: { published?: boolean } = {}
): Promise<{ documentId?: string; action: "created" | "updated" | "would-create" | "would-update" }> {
  if (mode !== "write") {
    const existing = await tryFindQuiet(uid, findFilters);
    return existing
      ? { documentId: existing.documentId, action: "would-update" }
      : { action: "would-create" };
  }
  const existing = await findOne(uid, findFilters);
  if (existing) {
    const updated = await updateEntry(uid, existing.documentId, payload, options);
    return { documentId: updated.documentId, action: "updated" };
  }
  const created = await createEntry(uid, payload, options);
  return { documentId: created.documentId, action: "created" };
}

/** In dry-run/validate mode we still *attempt* a lookup so the report can say
 * "would update" vs "would create", but connectivity is optional — any
 * failure (including Strapi being down) is swallowed silently. */
async function tryFindQuiet(uid: string, filters: Record<string, unknown>) {
  try {
    return await findOne(uid, filters);
  } catch {
    return undefined;
  }
}
