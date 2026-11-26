import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.validation.js';

/** Typed access to the validated environment (see env.validation.ts). */
@Injectable()
export class EnvironmentService {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Version in package.json, read from the directory the server runs in. */
  get version(): string {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { version?: string };
    if (!pkg.version) throw new Error('package.json has no version');
    return pkg.version;
  }

  get production(): boolean {
    return this.config.get('NODE_ENV') === 'production';
  }

  get iamBaseUrl(): string {
    return this.config.get('IAM_BASE_URL').replace(/\/+$/, '');
  }

  get clientId(): string {
    return this.config.get('IAM_CLIENT_ID');
  }

  get clientSecret(): string {
    return this.config.get('IAM_CLIENT_SECRET');
  }

  get callbackUrl(): string {
    return this.config.get('IAM_CALLBACK_URL');
  }

  get redisUrl(): string {
    return this.config.get('REDIS_URL');
  }
}
