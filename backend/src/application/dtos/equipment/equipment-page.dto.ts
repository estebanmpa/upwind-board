import { ApiProperty } from '@nestjs/swagger';
import { Equipment } from '../../../domain/entities/equipment.entity.js';

export class EquipmentPageDto {
  @ApiProperty({ type: () => [Equipment] })
  items: Equipment[];
  total: number;
  page: number;
  limit: number;
}
