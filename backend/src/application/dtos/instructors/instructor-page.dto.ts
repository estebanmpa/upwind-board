import { ApiProperty } from '@nestjs/swagger';
import { Instructor } from '../../../domain/entities/instructor.entity.js';

export class InstructorPageDto {
  @ApiProperty({ type: () => [Instructor] })
  items: Instructor[];
  total: number;
  page: number;
  limit: number;
}
