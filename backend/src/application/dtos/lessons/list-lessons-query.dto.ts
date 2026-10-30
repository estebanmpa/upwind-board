import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsUUID,
} from 'class-validator';
import type { LessonOrder } from '../../../domain/repositories/lesson.repository.js';
import { ToBoolean } from '../common/transformers.js';
import { PaginationQueryDto } from '../common/pagination-query.dto.js';

export class ListLessonsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  /** Only lessons without an instructor yet. */
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  unassigned?: boolean;

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

  /** By start date; 'asc' suits upcoming lessons. */
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: LessonOrder;
}
