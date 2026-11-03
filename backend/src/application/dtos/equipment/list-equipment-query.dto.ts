import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  EquipmentStatus,
  EquipmentType,
} from '../../../domain/entities/equipment.entity.js';
import { PaginationQueryDto } from '../common/pagination-query.dto.js';
import { Trim } from '../common/transformers.js';

export class ListEquipmentQueryDto extends PaginationQueryDto {
  /** Matches name, brand, model or serial number (case-insensitive). */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: EquipmentType, enumName: 'EquipmentType' })
  @IsOptional()
  @IsEnum(EquipmentType)
  type?: EquipmentType;

  @ApiPropertyOptional({ enum: EquipmentStatus, enumName: 'EquipmentStatus' })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;
}
