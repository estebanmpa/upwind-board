import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, MaxLength, ValidateIf } from 'class-validator';
import { TrimLowerCase } from '../common/transformers.js';
import { CreateStudentDto } from './create-student.dto.js';

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['email'] as const),
) {
  /** Can be omitted to keep the current one, but never cleared. */
  @ApiPropertyOptional()
  @ValidateIf((dto: UpdateStudentDto) => dto.email !== undefined)
  @TrimLowerCase()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
