import { Injectable } from '@nestjs/common';
import { Equipment } from '../../../domain/entities/equipment.entity.js';
import {
  EquipmentFilter,
  EquipmentRepository,
} from '../../../domain/repositories/equipment.repository.js';
import { Page, PageRequest } from '../../../domain/repositories/pagination.js';

@Injectable()
export class ListEquipmentUseCase {
  constructor(private readonly equipment: EquipmentRepository) {}

  execute(
    filter: EquipmentFilter,
    request: PageRequest,
  ): Promise<Page<Equipment>> {
    return this.equipment.findPage(filter, request);
  }
}
