import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EQUIPMENT_USE_CASES } from '../../application/use-cases/equipment/index.js';
import { EquipmentRepository } from '../../domain/repositories/equipment.repository.js';
import { EquipmentOrmEntity } from '../persistence/type-orm/entities/equipment.orm-entity.js';
import { TypeOrmEquipmentRepository } from '../persistence/type-orm/repositories/type-orm-equipment.repository.js';
import { EquipmentController } from '../rest/controllers/equipment.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentOrmEntity])],
  controllers: [EquipmentController],
  providers: [
    { provide: EquipmentRepository, useClass: TypeOrmEquipmentRepository },
    ...EQUIPMENT_USE_CASES,
  ],
  exports: [EquipmentRepository],
})
export class EquipmentModule {}
