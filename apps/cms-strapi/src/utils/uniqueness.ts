import { errors } from '@strapi/utils';

const { ApplicationError, ValidationError } = errors;

/**
 * Extract a numeric/string id from a relation connect/set payload or scalar.
 */
export function resolveRelationId(value: unknown): number | string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    const record = value as {
      id?: number | string;
      documentId?: string;
      connect?: unknown[];
      set?: unknown[];
    };

    if (record.id != null) {
      return record.id;
    }

    if (record.documentId != null) {
      return record.documentId;
    }

    const fromConnect = record.connect?.[0];
    if (fromConnect != null) {
      return resolveRelationId(fromConnect);
    }

    const fromSet = record.set?.[0];
    if (fromSet != null) {
      return resolveRelationId(fromSet);
    }
  }

  return null;
}

/**
 * Extract site ids from a many-to-many relation payload.
 */
export function resolveRelationIds(value: unknown): Array<number | string> {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => resolveRelationId(item))
      .filter((id): id is number | string => id != null);
  }

  if (typeof value === 'object') {
    const record = value as {
      connect?: unknown[];
      set?: unknown[];
    };

    const source = record.set ?? record.connect;
    if (Array.isArray(source)) {
      return source
        .map((item) => resolveRelationId(item))
        .filter((id): id is number | string => id != null);
    }
  }

  const single = resolveRelationId(value);
  return single == null ? [] : [single];
}

export function assertUnique(
  condition: boolean,
  message: string,
  details?: Record<string, unknown>
): asserts condition {
  if (!condition) {
    throw new ApplicationError(message, details);
  }
}

export function validationError(message: string, details?: Record<string, unknown>): never {
  throw new ValidationError(message, details);
}

/**
 * Build a where clause that excludes the current row when updating.
 */
export function excludeCurrentId(
  where: Record<string, unknown>,
  currentId?: number | string | null
): Record<string, unknown> {
  if (currentId == null) {
    return where;
  }

  return {
    ...where,
    id: { $ne: currentId },
  };
}
