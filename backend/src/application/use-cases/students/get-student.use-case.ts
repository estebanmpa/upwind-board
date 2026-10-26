import { Injectable } from '@nestjs/common';
import { Student } from '../../../domain/entities/student.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';

@Injectable()
export class GetStudentUseCase {
  constructor(private readonly students: StudentRepository) {}

  async execute(id: string): Promise<Student> {
    const student = await this.students.findById(id);
    if (!student) throw new NotFoundError('Student', id);
    return student;
  }
}
