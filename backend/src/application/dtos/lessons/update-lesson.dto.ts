import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto.js';
import { LessonStudentInputDto } from './lesson-input.dto.js';

export class UpdateLessonDto extends PartialType(
  OmitType(CreateLessonDto, ['students'] as const),
) {
  @ApiPropertyOptional({
    type: () => [LessonStudentInputDto],
    description:
      'Full list of participants. Students missing from it are removed from ' +
      'the lesson (with their records). For students already in the lesson, ' +
      'omitted fields keep their value and an omitted skillRecords keeps the ' +
      'current records; a provided skillRecords replaces them.',
  })
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LessonStudentInputDto)
  students?: LessonStudentInputDto[];
}
