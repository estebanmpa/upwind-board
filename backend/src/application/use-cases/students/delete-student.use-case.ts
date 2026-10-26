import { Injectable } from '@nestjs/common';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';

@Injectable()
export class DeleteStudentUseCase {
  constructor(private readonly students: StudentRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.students.findById(id))) {
      throw new NotFoundError('Student', id);
    }
    if (await this.students.hasLessons(id)) {
      throw new ConflictError(
        'The student has lessons; remove them from those lessons first',
      );
    }
    await this.students.delete(id);
  }
}
