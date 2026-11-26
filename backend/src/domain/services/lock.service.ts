/** Distributed mutual exclusion shared by every backend instance. */
export abstract class LockService {
  /** @returns an ownership token, or undefined if the lock is held elsewhere */
  abstract tryAcquire(key: string, ttlMs: number): Promise<string | undefined>;
  abstract release(key: string, ownershipToken: string): Promise<void>;
}
