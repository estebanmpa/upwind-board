import { Injectable } from '@nestjs/common';
import { Student } from '../../../domain/entities/student.entity.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { CreateStudentDto } from '../../dtos/students/create-student.dto.js';

@Injectable()
export class CreateStudentUseCase {
  constructor(private readonly students: StudentRepository) {}

  execute(dto: CreateStudentDto): Promise<Student> {
    return this.students.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email ?? null,
      phone: dto.phone,
      birthDate: dto.birthDate ?? null,
      weightKg: dto.weightKg ?? null,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      notes: dto.notes ?? null,
    });
  }
}
