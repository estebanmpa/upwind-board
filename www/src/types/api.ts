export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}

/** Error body returned by every API endpoint. */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface PersonSummary {
  id: string;
  firstName: string;
  lastName: string;
}
