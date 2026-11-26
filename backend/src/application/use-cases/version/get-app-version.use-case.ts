import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '../../../infrastructure/services/environment.service.js';

export interface AppVersion {
  version: string;
}

@Injectable()
export class GetAppVersionUseCase {
  private cached?: AppVersion;

  constructor(private readonly environment: EnvironmentService) {}

  execute(): AppVersion {
    this.cached ??= { version: this.environment.version };
    return this.cached;
  }
}
