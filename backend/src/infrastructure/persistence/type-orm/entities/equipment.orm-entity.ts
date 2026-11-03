import { Column, Entity, Index, Unique } from 'typeorm';
import {
  EquipmentStatus,
  EquipmentType,
} from '../../../../domain/entities/equipment.entity.js';
import { BaseOrmEntity } from './base.orm-entity.js';

@Entity({ name: 'equipment' })
@Unique('uq_equipment_serial_number', ['serialNumber'])
export class EquipmentOrmEntity extends BaseOrmEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Index('idx_equipment_type')
  @Column({
    name: 'type',
    type: 'enum',
    enum: EquipmentType,
    enumName: 'equipment_type',
  })
  type: EquipmentType;

  @Column({ name: 'brand', type: 'varchar', length: 100, nullable: true })
  brand: string | null;

  @Column({ name: 'model', type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @Column({ name: 'size', type: 'varchar', length: 50, nullable: true })
  size: string | null;

  @Column({
    name: 'serial_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  serialNumber: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EquipmentStatus,
    enumName: 'equipment_status',
    default: EquipmentStatus.Available,
  })
  status: EquipmentStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}
