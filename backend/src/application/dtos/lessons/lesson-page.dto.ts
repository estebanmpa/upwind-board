import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '../../../domain/entities/lesson.entity.js';

export class LessonPageDto {
  @ApiProperty({ type: () => [Lesson] })
  items: Lesson[];
  total: number;
  page: number;
  limit: number;
}
