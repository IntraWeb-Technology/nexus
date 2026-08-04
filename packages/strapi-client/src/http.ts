import type { ResolvedStrapiConfig } from "./config.js";
import {
  StrapiHttpError,
  StrapiTimeoutError,
  StrapiClientError,
} from "./errors.js";

export type HttpGetOptions = {
  path: string;
  query?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export async function strapiGet(
  config: ResolvedStrapiConfig,
  options: HttpGetOptions,
): Promise<unknown> {
  const timeoutMs = options.timeoutMs ?? config.defaultTimeoutMs;
  const url = `${config.baseUrl}${options.path}${
    options.query ? `?${options.query}` : ""
  }`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  try {
    const response = await config.fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    const body = await readBody(response);

    if (!response.ok) {
      throw new StrapiHttpError(
        response.status,
        options.path,
        body,
      );
    }

    return body;
  } catch (error) {
    if (error instanceof StrapiHttpError) throw error;
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new StrapiTimeoutError(options.path, timeoutMs);
    }
    throw new StrapiClientError(
      `Strapi network error for ${options.path}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "NETWORK",
      error,
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
