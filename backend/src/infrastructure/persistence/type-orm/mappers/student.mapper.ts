import { Student } from '../../../../domain/entities/student.entity.js';
import { StudentOrmEntity } from '../entities/student.orm-entity.js';

export class StudentMapper {
  static toDomain(entity: StudentOrmEntity): Student {
    return new Student({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      birthDate: entity.birthDate,
      weightKg: entity.weightKg,
      emergencyContactName: entity.emergencyContactName,
      emergencyContactPhone: entity.emergencyContactPhone,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
