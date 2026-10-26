import { notFound } from '@tanstack/react-router';
import { ApiError } from '@/api/http';

/** Turns a missing (404) or malformed (400) id into the router's not-found page. */
export async function ensureOrNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      throw notFound();
    }
    throw error;
  }
}
