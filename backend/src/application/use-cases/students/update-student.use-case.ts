import { Injectable } from '@nestjs/common';
import { Student } from '../../../domain/entities/student.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { UpdateStudentDto } from '../../dtos/students/update-student.dto.js';

/** Blank optional text is stored as null; `undefined` keeps the current value. */
const blankToNull = (value: string | null | undefined) =>
  value === '' ? null : value;

@Injectable()
export class UpdateStudentUseCase {
  constructor(private readonly students: StudentRepository) {}

  async execute(id: string, dto: UpdateStudentDto): Promise<Student> {
    if (!(await this.students.findById(id))) {
      throw new NotFoundError('Student', id);
    }
    return this.students.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: blankToNull(dto.phone),
      birthDate: dto.birthDate,
      weightKg: dto.weightKg,
      emergencyContactName: blankToNull(dto.emergencyContactName),
      emergencyContactPhone: blankToNull(dto.emergencyContactPhone),
      notes: dto.notes,
    });
  }
}
