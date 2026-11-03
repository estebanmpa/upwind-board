import { Injectable } from '@nestjs/common';
import {
  Equipment,
  EquipmentStatus,
} from '../../../domain/entities/equipment.entity.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';
import { CreateEquipmentDto } from '../../dtos/equipment/create-equipment.dto.js';
import { assertSerialNumberIsFree } from './serial-number.guard.js';

@Injectable()
export class CreateEquipmentUseCase {
  constructor(private readonly equipment: EquipmentRepository) {}

  async execute(dto: CreateEquipmentDto): Promise<Equipment> {
    const serialNumber = dto.serialNumber || null;
    await assertSerialNumberIsFree(this.equipment, serialNumber);
    return this.equipment.create({
      name: dto.name,
      type: dto.type,
      brand: dto.brand || null,
      model: dto.model || null,
      size: dto.size || null,
      serialNumber,
      status: dto.status ?? EquipmentStatus.Available,
      notes: dto.notes || null,
    });
  }
}
