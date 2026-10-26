import type { ApiErrorBody } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

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
      headers:
        options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
