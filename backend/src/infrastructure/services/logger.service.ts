import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '../../domain/services/logger.service.js';

@Injectable()
export class NestLoggerService extends LoggerService {
  private readonly logger = new Logger('App');

  info(message: string, data?: unknown): void {
    this.logger.log(this.format(message, data));
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(this.format(message, data));
  }

  error(message: string, data?: unknown): void {
    this.logger.error(this.format(message, data));
  }

  private format(message: string, data?: unknown): string {
    if (data === undefined) return message;
    const detail = data instanceof Error ? data.message : JSON.stringify(data);
    return `${message}: ${detail}`;
  }
}
