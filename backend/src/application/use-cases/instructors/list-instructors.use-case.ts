import { Injectable } from '@nestjs/common';
import { Instructor } from '../../../domain/entities/instructor.entity.js';
import {
  InstructorFilter,
  InstructorRepository,
} from '../../../domain/repositories/instructor.repository.js';
import { Page, PageRequest } from '../../../domain/repositories/pagination.js';

@Injectable()
export class ListInstructorsUseCase {
  constructor(private readonly instructors: InstructorRepository) {}

  execute(
    filter: InstructorFilter,
    request: PageRequest,
  ): Promise<Page<Instructor>> {
    return this.instructors.findPage(filter, request);
  }
}
