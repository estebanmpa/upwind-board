import { Injectable } from '@nestjs/common';
import { Instructor } from '../../../domain/entities/instructor.entity.js';
import { ConflictError } from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { CreateInstructorDto } from '../../dtos/instructors/create-instructor.dto.js';

@Injectable()
export class CreateInstructorUseCase {
  constructor(private readonly instructors: InstructorRepository) {}

  async execute(dto: CreateInstructorDto): Promise<Instructor> {
    if (await this.instructors.findByEmail(dto.email)) {
      throw new ConflictError(
        `An instructor with email "${dto.email}" already exists`,
      );
    }
    return this.instructors.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      ikoInstructorId: dto.ikoInstructorId ?? null,
      active: dto.active ?? true,
    });
  }
}
