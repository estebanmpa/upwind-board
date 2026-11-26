import type { ApiErrorBody } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

/** Dispatched on window when the API rejects the session (HTTP 401). */
export const UNAUTHORIZED_EVENT = 'api-unauthorized';

// A 401 from these is part of the login flow itself, not an expired session.
const AUTH_FLOW_PATHS = ['/auth/token', '/auth/logout'];

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: object;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildQueryString(query: object = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query as Record<string, QueryValue>)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const details = Array.isArray(body?.message)
    ? body.message
    : body?.message
      ? [body.message]
      : [];
  return new ApiError(
    response.status,
    details.join('. ') || response.statusText,
    details,
  );
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}${buildQueryString(options.query)}`, {
      method: options.method ?? 'GET',
      // Sends the httpOnly session cookie, also when the API is on another domain.
      credentials: 'include',
      headers:
        options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'Could not connect to the server');
  }

  if (!response.ok) {
    if (response.status === 401 && !AUTH_FLOW_PATHS.includes(path)) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    throw await toApiError(response);
  }
  return parseBody<T>(response);
}

/** Endpoints may answer JSON, plain text (e.g. a URL) or nothing at all. */
async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return undefined as T;
  const isJson = response.headers.get('Content-Type')?.includes('application/json');
  return (isJson ? JSON.parse(text) : text) as T;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
