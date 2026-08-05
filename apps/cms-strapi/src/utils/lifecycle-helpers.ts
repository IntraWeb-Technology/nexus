import { errors } from '@strapi/utils';

export const { ApplicationError } = errors;

type RelationId = number | string;

type RelationMutation = {
  connect?: Array<RelationId | { id: RelationId }>;
  set?: Array<RelationId | { id: RelationId }>;
};

type RelationInput =
  | RelationId
  | { id: RelationId }
  | Array<RelationId | { id: RelationId }>
  | RelationMutation
  | null
  | undefined;

/**
 * Normalizes the many shapes Strapi accepts for relation write payloads
 * (raw id, `{ id }`, an array of either, or a `{ connect | set }` mutation
 * object used by the Document Service) into a flat array of ids.
 *
 * Lifecycle hooks run at the database-query layer, one level below the
 * Document Service, so the payload shape they see depends on how the
 * write was issued (REST/Document Service vs. `strapi.db.query` directly).
 * This helper covers all shapes we expect to encounter in practice.
 */
export function extractRelationIds(input: RelationInput): RelationId[] {
  if (input === null || input === undefined) return [];

  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === 'object' && item !== null ? (item as { id: RelationId }).id : item))
      .filter((id): id is RelationId => id !== null && id !== undefined);
  }

  if (typeof input === 'object') {
    if ('connect' in input || 'set' in input) {
      const mutation = input as RelationMutation;
      return extractRelationIds(mutation.set ?? mutation.connect ?? []);
    }
    if ('id' in input) {
      return [(input as { id: RelationId }).id];
    }
    return [];
  }

  return [input];
}

export function extractRelationId(input: RelationInput): RelationId | undefined {
  return extractRelationIds(input)[0];
}

export function idsOverlap(a: RelationId[], b: RelationId[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const setB = new Set(b.map(String));
  return a.some((id) => setB.has(String(id)));
}
