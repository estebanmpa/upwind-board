import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PageRequest } from '../../../domain/repositories/pagination.js';

export class PaginationQueryDto {
  /** 1-based page number. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Items per page (max 100). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  toPageRequest(): PageRequest {
    return { page: this.page ?? 1, limit: this.limit ?? 20 };
  }
}
