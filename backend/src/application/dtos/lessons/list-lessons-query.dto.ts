import { IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../common/pagination-query.dto.js';

export class ListLessonsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  /** Lessons starting at or after this instant. */
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  /** Lessons starting before this instant. */
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}
