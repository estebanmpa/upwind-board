import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../common/pagination-query.dto.js';
import { ToBoolean, Trim } from '../common/transformers.js';

export class ListInstructorsQueryDto extends PaginationQueryDto {
  /** Matches first name, last name or full name (case-insensitive). */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  active?: boolean;
}
