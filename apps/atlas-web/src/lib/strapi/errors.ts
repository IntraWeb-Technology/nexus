/** Atlas content-layer errors — never silent fixture fallback when Strapi is required. */

export type AtlasContentErrorCode =
  | "STRAPI_UNAVAILABLE"
  | "SITE_MISSING"
  | "SINGLETON_MISSING"
  | "ENTRY_MISSING"
  | "MALFORMED_CONTENT"
  | "CONFIGURATION";

export class AtlasContentError extends Error {
  readonly code: AtlasContentErrorCode;

  constructor(code: AtlasContentErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AtlasContentError";
    this.code = code;
  }
}
