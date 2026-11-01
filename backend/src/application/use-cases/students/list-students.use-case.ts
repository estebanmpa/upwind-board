import { Injectable } from '@nestjs/common';
import { Student } from '../../../domain/entities/student.entity.js';
import { Page, PageRequest } from '../../../domain/repositories/pagination.js';
import {
  StudentFilter,
  StudentRepository,
} from '../../../domain/repositories/student.repository.js';

@Injectable()
export class ListStudentsUseCase {
  constructor(private readonly students: StudentRepository) {}

  execute(filter: StudentFilter, request: PageRequest): Promise<Page<Student>> {
    return this.students.findPage(filter, request);
  }
}
