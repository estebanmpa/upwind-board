import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { WIND_DIRECTIONS } from '../../../domain/entities/wind-direction.js';
import { Trim, TrimUpperCase } from '../common/transformers.js';
import { LessonStudentInputDto } from './lesson-input.dto.js';

export class CreateLessonDto {
  @IsUUID()
  instructorId: string;

  /** ISO 8601 with timezone offset. @example 2026-11-02T15:00:00-03:00 */
  @IsISO8601({ strict: true })
  @Matches(/(Z|[+-]\d{2}:?\d{2})$/, {
    message: 'startsAt must include a timezone offset (e.g. Z or -03:00)',
  })
  startsAt: string;

  /** @example 120 */
  @IsInt()
  @Min(1)
  @Max(720)
  durationMinutes: number;

  /** @example Punta Lara */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  spot: string;

  @ApiProperty({ enum: WIND_DIRECTIONS, required: false, nullable: true })
  @IsOptional()
  @TrimUpperCase()
  @IsIn(WIND_DIRECTIONS)
  windDirection?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  windMinKnots?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  windMaxKnots?: number | null;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;

  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LessonStudentInputDto)
  students: LessonStudentInputDto[];
}
