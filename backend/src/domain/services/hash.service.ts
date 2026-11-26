export abstract class HashService {
  /** A random, URL-safe identifier suitable for session ids. */
  abstract randomBytes(): string;
}
