import { Injectable } from '@nestjs/common';
import { Instructor } from '../../../domain/entities/instructor.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';

@Injectable()
export class GetInstructorUseCase {
  constructor(private readonly instructors: InstructorRepository) {}

  async execute(id: string): Promise<Instructor> {
    const instructor = await this.instructors.findById(id);
    if (!instructor) throw new NotFoundError('Instructor', id);
    return instructor;
  }
}
