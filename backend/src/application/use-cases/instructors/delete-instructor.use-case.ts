import { Injectable } from '@nestjs/common';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';

@Injectable()
export class DeleteInstructorUseCase {
  constructor(private readonly instructors: InstructorRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.instructors.findById(id))) {
      throw new NotFoundError('Instructor', id);
    }
    if (await this.instructors.hasLessons(id)) {
      throw new ConflictError(
        'The instructor has lessons; set active to false instead',
      );
    }
    await this.instructors.delete(id);
  }
}
