import { Injectable } from '@nestjs/common';
import { Equipment } from '../../../domain/entities/equipment.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';
import { UpdateEquipmentDto } from '../../dtos/equipment/update-equipment.dto.js';
import { assertSerialNumberIsFree } from './serial-number.guard.js';

/** `undefined` means "not sent"; an empty string clears the field. */
const optional = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

@Injectable()
export class UpdateEquipmentUseCase {
  constructor(private readonly equipment: EquipmentRepository) {}

  async execute(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    if (!(await this.equipment.findById(id))) {
      throw new NotFoundError('Equipment', id);
    }
    const serialNumber = optional(dto.serialNumber);
    await assertSerialNumberIsFree(this.equipment, serialNumber, id);

    return this.equipment.update(id, {
      name: dto.name,
      type: dto.type,
      brand: optional(dto.brand),
      model: optional(dto.model),
      size: optional(dto.size),
      serialNumber,
      status: dto.status,
      notes: optional(dto.notes),
    });
  }
}
