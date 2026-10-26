import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SkillStatus } from '../../../domain/entities/skill-status.enum.js';
import { Trim } from '../common/transformers.js';

export class LessonSkillRecordInputDto {
  /** Must be a leaf of the skill tree. */
  @IsUUID()
  skillId: string;

  @IsEnum(SkillStatus)
  status: SkillStatus;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;
}

export class LessonStudentInputDto {
  @IsUUID()
  studentId: string;

  /** @example 9 */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsPositive()
  @Max(30)
  kiteSizeM2?: number | null;

  /** @example Twin tip 138 */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  board?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;

  /**
   * Skills worked by this student in the lesson (one per skill).
   * On update, omitting it keeps the current records.
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonSkillRecordInputDto)
  skillRecords?: LessonSkillRecordInputDto[];
}
