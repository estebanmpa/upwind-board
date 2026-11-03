import { Injectable } from '@nestjs/common';
import { Equipment } from '../../../domain/entities/equipment.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';

@Injectable()
export class GetEquipmentUseCase {
  constructor(private readonly equipment: EquipmentRepository) {}

  async execute(id: string): Promise<Equipment> {
    const item = await this.equipment.findById(id);
    if (!item) throw new NotFoundError('Equipment', id);
    return item;
  }
}
