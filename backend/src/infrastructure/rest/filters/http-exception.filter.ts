import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import {
  BusinessRuleViolationError,
  ConflictError,
  DomainError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';

export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';
const PG_CHECK_VIOLATION = '23514';

/** Maps every error to the same JSON shape so clients handle a single format. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.resolve(exception);
    if (status >= 500) {
      this.logger.error(exception);
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'ERROR',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : exception.message;
      return { status: exception.getStatus(), message };
    }
    if (exception instanceof DomainError) {
      return {
        status: this.domainStatus(exception),
        message: exception.message,
      };
    }
    if (exception instanceof QueryFailedError) {
      const code = (exception.driverError as { code?: string } | undefined)
        ?.code;
      switch (code) {
        case PG_UNIQUE_VIOLATION:
          return {
            status: HttpStatus.CONFLICT,
            message: 'A record with the same unique value already exists',
          };
        case PG_FOREIGN_KEY_VIOLATION:
          return {
            status: HttpStatus.CONFLICT,
            message: 'The record is referenced by or references other records',
          };
        case PG_INVALID_TEXT_REPRESENTATION:
        case PG_CHECK_VIOLATION:
          return { status: HttpStatus.BAD_REQUEST, message: 'Invalid value' };
      }
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private domainStatus(error: DomainError): number {
    if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof ConflictError) return HttpStatus.CONFLICT;
    if (error instanceof BusinessRuleViolationError)
      return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
