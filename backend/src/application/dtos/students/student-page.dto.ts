import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../../domain/entities/student.entity.js';

export class StudentPageDto {
  @ApiProperty({ type: () => [Student] })
  items: Student[];
  total: number;
  page: number;
  limit: number;
}
