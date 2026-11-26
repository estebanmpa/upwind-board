import type { CookieOptions } from 'express';

export class Cookie {
  constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly options: CookieOptions,
  ) {}
}
