import { Instructor } from '../../../../domain/entities/instructor.entity.js';
import { InstructorOrmEntity } from '../entities/instructor.orm-entity.js';

export class InstructorMapper {
  static toDomain(entity: InstructorOrmEntity): Instructor {
    return new Instructor({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      ikoInstructorId: entity.ikoInstructorId,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
