import { Global, Module } from '@nestjs/common';
import { HashService } from '../../domain/services/hash.service.js';
import { LoggerService } from '../../domain/services/logger.service.js';
import { RequestDataService } from '../../domain/services/request-data.service.js';
import { RedisModule } from '../cache/redis.module.js';
import { EnvironmentService } from '../services/environment.service.js';
import { CryptoHashService } from '../services/hash.service.js';
import { NestLoggerService } from '../services/logger.service.js';
import { InMemoryRequestDataService } from '../services/request-data.service.js';

const services = [
  EnvironmentService,
  { provide: HashService, useClass: CryptoHashService },
  { provide: LoggerService, useClass: NestLoggerService },
  { provide: RequestDataService, useClass: InMemoryRequestDataService },
];

/** Cross-cutting services every module (and the IAM integration) relies on. */
@Global()
@Module({
  imports: [RedisModule],
  providers: services,
  exports: [RedisModule, ...services],
})
export class GlobalModule {}
