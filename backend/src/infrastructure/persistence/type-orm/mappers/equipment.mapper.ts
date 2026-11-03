import { Equipment } from '../../../../domain/entities/equipment.entity.js';
import { EquipmentOrmEntity } from '../entities/equipment.orm-entity.js';

export class EquipmentMapper {
  static toDomain(entity: EquipmentOrmEntity): Equipment {
    return new Equipment({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      brand: entity.brand,
      model: entity.model,
      size: entity.size,
      serialNumber: entity.serialNumber,
      status: entity.status,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
