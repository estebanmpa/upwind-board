import { Injectable } from '@nestjs/common';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';

@Injectable()
export class DeleteEquipmentUseCase {
  constructor(private readonly equipment: EquipmentRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.equipment.findById(id))) {
      throw new NotFoundError('Equipment', id);
    }
    if (await this.equipment.hasLessons(id)) {
      throw new ConflictError(
        'The equipment is assigned to lessons; set its status to retired instead',
      );
    }
    await this.equipment.delete(id);
  }
}
