export type RequestDataKey = 'session';

/** Values attached to the current HTTP request (e.g. its session). */
export abstract class RequestDataService {
  abstract get<T = unknown>(key: RequestDataKey): T;
  abstract set(key: RequestDataKey, value: unknown): void;
}
