export type StrapiErrorCode =
  | "HTTP_ERROR"
  | "TIMEOUT"
  | "NETWORK"
  | "VALIDATION"
  | "INVALID_CONFIG";

export class StrapiClientError extends Error {
  readonly code: StrapiErrorCode;
  readonly cause?: unknown;

  constructor(message: string, code: StrapiErrorCode, cause?: unknown) {
    super(message);
    this.name = "StrapiClientError";
    this.code = code;
    this.cause = cause;
  }
}

export class StrapiHttpError extends StrapiClientError {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(status: number, path: string, body: unknown, message?: string) {
    super(
      message ?? `Strapi request failed (${status}) for ${path}`,
      "HTTP_ERROR",
      body,
    );
    this.name = "StrapiHttpError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

export class StrapiTimeoutError extends StrapiClientError {
  readonly path: string;
  readonly timeoutMs: number;

  constructor(path: string, timeoutMs: number) {
    super(
      `Strapi request timed out after ${timeoutMs}ms for ${path}`,
      "TIMEOUT",
    );
    this.name = "StrapiTimeoutError";
    this.path = path;
    this.timeoutMs = timeoutMs;
  }
}

export class StrapiValidationError extends StrapiClientError {
  readonly issues: unknown;
  readonly path: string;

  constructor(path: string, issues: unknown, message?: string) {
    super(
      message ?? `Strapi response failed validation for ${path}`,
      "VALIDATION",
      issues,
    );
    this.name = "StrapiValidationError";
    this.path = path;
    this.issues = issues;
  }
}
