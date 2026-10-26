import { Injectable } from '@nestjs/common';
import { Instructor } from '../../../domain/entities/instructor.entity.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { UpdateInstructorDto } from '../../dtos/instructors/update-instructor.dto.js';

@Injectable()
export class UpdateInstructorUseCase {
  constructor(private readonly instructors: InstructorRepository) {}

  async execute(id: string, dto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.instructors.findById(id);
    if (!instructor) throw new NotFoundError('Instructor', id);

    if (dto.email !== undefined && dto.email !== instructor.email) {
      const sameEmail = await this.instructors.findByEmail(dto.email);
      if (sameEmail && sameEmail.id !== id) {
        throw new ConflictError(
          `An instructor with email "${dto.email}" already exists`,
        );
      }
    }

    return this.instructors.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      ikoInstructorId: dto.ikoInstructorId,
      active: dto.active,
    });
  }
}
