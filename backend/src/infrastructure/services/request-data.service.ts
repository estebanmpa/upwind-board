import { Injectable, Scope } from '@nestjs/common';
import {
  RequestDataKey,
  RequestDataService,
} from '../../domain/services/request-data.service.js';

@Injectable({ scope: Scope.REQUEST })
export class InMemoryRequestDataService extends RequestDataService {
  private readonly data: Partial<Record<RequestDataKey, unknown>> = {};

  get<T = unknown>(key: RequestDataKey): T {
    return this.data[key] as T;
  }

  set(key: RequestDataKey, value: unknown): void {
    this.data[key] = value;
  }
}
